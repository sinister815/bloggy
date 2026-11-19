/**
 * Bloggy MCP server (Cloudflare Worker).
 *
 * A real Model Context Protocol server over Streamable HTTP, built with MCP
 * TypeScript SDK v2 (`@modelcontextprotocol/server`, spec 2026-07-28).
 * `createMcpHandler` serves a stateless endpoint: a fresh McpServer is built
 * per request, so no Durable Object or session store is needed.
 *
 * The Worker holds no database credentials. Every tool call is proxied to the
 * API server (/api/mcp/*) with the shared x-api-key header, so Pixabay and
 * Cloudinary keys stay only on the backend.
 */
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

const SERVER_NAME = 'bloggy-mcp'
const SERVER_VERSION = '2.0.0'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })

/** Constant-time token comparison (both sides hashed first). */
async function safeEqual(left, right) {
  const encoder = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(String(left ?? ''))),
    crypto.subtle.digest('SHA-256', encoder.encode(String(right ?? ''))),
  ])
  const viewA = new Uint8Array(a)
  const viewB = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < viewA.length; i += 1) diff |= viewA[i] ^ viewB[i]
  return diff === 0
}

const buildQuery = (params) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** One request to the API server, with the shared MCP key. */
async function callApi(env, path, { method = 'GET', body } = {}) {
  const base = String(env.API_BASE || '').replace(/\/+$/, '')
  if (!base) throw new Error('API_BASE is not configured on this Worker')
  if (!env.MCP_API_KEY) throw new Error('MCP_API_KEY secret is not configured on this Worker')

  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.MCP_API_KEY,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    // A non-JSON body usually means the route is not deployed yet (Express 404).
    throw new Error(
      `API ${path} returned HTTP ${response.status} with a non-JSON body. ` +
        'Check that API_BASE points at /api/mcp and the backend is deployed.',
    )
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `API responded with HTTP ${response.status}`)
  }

  return data
}

/** Tool result carrying pretty JSON, the most widely understood shape. */
const result = (data) => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
})

const failure = (error) => ({
  isError: true,
  content: [{ type: 'text', text: `Error: ${error.message}` }],
})

const slugSchema = z
  .string()
  .min(1)
  .describe('Post slug, e.g. "jwt-cookies" (lowercase, hyphen separated, unique)')

const imageInputs = {
  imageQuery: z
    .string()
    .optional()
    .describe('Pixabay search term. The most popular match is imported into Cloudinary.'),
  imageId: z
    .union([z.string(), z.number()])
    .optional()
    .describe('Pixabay image id, as returned by search_images.'),
  imageUrl: z
    .string()
    .optional()
    .describe('A https://pixabay.com image URL, as returned by search_images.'),
}

/* ------------------------------------------------------------------ */
/* server factory                                                      */
/* ------------------------------------------------------------------ */

function buildServer(env) {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION })

  server.registerTool(
    'list_posts',
    {
      title: 'List Bloggy posts',
      description:
        'List posts with pagination. Defaults to every status, so drafts (status "inactive") are included. Returns metadata only; call get_post for the full body.',
      inputSchema: {
        status: z
          .enum(['all', 'active', 'inactive'])
          .optional()
          .describe('Filter by publish status. Default "all".'),
        search: z.string().optional().describe('Full-text search across title, content and tags.'),
        page: z.number().int().min(1).optional().describe('1-based page number. Default 1.'),
        limit: z.number().int().min(1).max(50).optional().describe('Page size, 1-50. Default 20.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ status, search, page, limit }) => {
      try {
        const data = await callApi(env, `/posts${buildQuery({ status, search, page, limit })}`)
        return result({
          page: data.page,
          pages: data.pages,
          total: data.total,
          status: data.status,
          posts: data.rows,
        })
      } catch (error) {
        return failure(error)
      }
    },
  )

  server.registerTool(
    'get_post',
    {
      title: 'Get one Bloggy post',
      description:
        'Fetch a single post by slug, including its full HTML content and cover image. Works for drafts too.',
      inputSchema: { slug: slugSchema },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ slug }) => {
      try {
        const data = await callApi(env, `/posts/${encodeURIComponent(slug)}`)
        return result(data.post)
      } catch (error) {
        return failure(error)
      }
    },
  )

  server.registerTool(
    'create_post',
    {
      title: 'Create a Bloggy post',
      description:
        'Publish a new post. When imageQuery, imageId or imageUrl is supplied, Pixabay is searched, the image is copied into Cloudinary and used as the cover — no manual upload needed.',
      inputSchema: {
        title: z.string().min(1),
        slug: slugSchema,
        content: z.string().min(1).describe('Post body as HTML (TinyMCE-compatible).'),
        excerpt: z.string().optional().describe('Short summary. Derived from content when omitted.'),
        tags: z.array(z.string()).optional().describe('Tag list, e.g. ["javascript", "node"].'),
        category: z.string().optional().describe('Category slug. Default "general".'),
        status: z
          .enum(['active', 'inactive'])
          .optional()
          .describe('"active" publishes immediately, "inactive" keeps it as a draft.'),
        includeContent: z
          .boolean()
          .optional()
          .describe('Echo the full HTML body back. Default false keeps the reply small.'),
        ...imageInputs,
      },
      annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const data = await callApi(env, '/posts', { method: 'POST', body: args })
        return result({ created: true, post: data.post })
      } catch (error) {
        return failure(error)
      }
    },
  )

  server.registerTool(
    'update_post',
    {
      title: 'Update a Bloggy post',
      description:
        'Partially update an existing post (any status). Send only the fields that change. Body editing: content replaces the whole body, contentAppend adds a chunk at the end, contentReplace swaps an exact snippet (one content mode per call). Passing imageQuery/imageId/imageUrl replaces the cover, removeImage drops it, and the old Cloudinary asset is deleted. A slug change also renames the Cloudinary cover.',
      inputSchema: {
        slug: slugSchema.describe('Slug of the post to update'),
        title: z.string().optional(),
        newSlug: z.string().optional().describe('New slug, if the URL should change too.'),
        content: z
          .string()
          .optional()
          .describe('Full replacement HTML body. Do not combine with contentAppend/contentReplace.'),
        contentAppend: z
          .string()
          .optional()
          .describe(
            'HTML appended to the end of the body (new section, FAQ, conclusion). The same chunk is never appended twice. Use this to write long articles in short, verifiable steps.',
          ),
        contentReplace: z
          .object({
            find: z.string().min(1).describe('Exact literal text to find (copy it verbatim).'),
            replace: z.string().describe('Replacement text. Empty string deletes the match.'),
            all: z.boolean().optional().describe('Replace every match. Default false; more than one match without it is rejected.'),
          })
          .optional()
          .describe(
            'Exact-text replacement: fix a typo, reword a paragraph, or insert an image/section before an existing heading (anchor on the heading).',
          ),
        excerpt: z.string().optional(),
        includeContent: z
          .boolean()
          .optional()
          .describe('Echo the full HTML body back. Default false keeps the reply small.'),
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
        removeImage: z.boolean().optional().describe('Delete the current cover image.'),
        ...imageInputs,
      },
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ slug, newSlug, ...changes }) => {
      try {
        const body = { ...changes }
        if (newSlug) body.slug = newSlug
        const data = await callApi(env, `/posts/${encodeURIComponent(slug)}`, {
          method: 'PATCH',
          body,
        })
        return result({ updated: true, post: data.post })
      } catch (error) {
        return failure(error)
      }
    },
  )

  server.registerTool(
    'delete_post',
    {
      title: 'Delete a Bloggy post',
      description:
        'Permanently delete a post and its Cloudinary cover. Requires confirm: true — an accidental call without it is rejected by this server.',
      inputSchema: {
        slug: slugSchema,
        confirm: z
          .boolean()
          .describe('Must be true. Guards against an accidental destructive call.'),
      },
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, confirm }) => {
      if (confirm !== true) {
        return failure(
          new Error('Refusing to delete without confirm: true. Ask the user before deleting.'),
        )
      }
      try {
        const data = await callApi(env, `/posts/${encodeURIComponent(slug)}`, {
          method: 'DELETE',
        })
        return result(data)
      } catch (error) {
        return failure(error)
      }
    },
  )

  server.registerTool(
    'search_images',
    {
      title: 'Search Pixabay images',
      description:
        'Search Pixabay for horizontal photos (safe search on, min 1200px wide) and return candidates with their Pixabay ids and URLs. Nothing is uploaded until import_image or a create/update with an image input is called.',
      inputSchema: {
        query: z.string().optional().describe('Search term, e.g. "coffee shop".'),
        imageId: z
          .union([z.string(), z.number()])
          .optional()
          .describe('Look up one specific Pixabay image by id.'),
        perPage: z.number().int().min(3).max(50).optional().describe('Results, 3-50. Default 12.'),
        page: z.number().int().min(1).optional(),
        orientation: z
          .enum(['all', 'horizontal', 'vertical'])
          .optional()
          .describe('Default "horizontal" (best for 16:9 covers).'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ query, imageId, perPage, page, orientation }) => {
      try {
        const data = await callApi(
          env,
          `/images${buildQuery({
            q: query,
            id: imageId,
            per_page: perPage,
            page,
            orientation,
          })}`,
        )
        return result({ count: data.count, images: data.images })
      } catch (error) {
        return failure(error)
      }
    },
  )

  server.registerTool(
    'import_image',
    {
      title: 'Import a Pixabay image into Cloudinary',
      description:
        'Copy a Pixabay image into Cloudinary under a name derived from the post slug. Two modes: attachToPost: true attaches/replaces the post cover (stored as covers/<slug>); default (false) stores an in-article image as inline/<slug>-N and returns a ready <figure> tag with alt text and Pixabay credit to paste into the content. Identify the image with imageId (from search_images), imageUrl, or a fresh imageQuery.',
      inputSchema: {
        slug: slugSchema.describe('Post slug; it is also the Cloudinary asset name'),
        attachToPost: z
          .boolean()
          .optional()
          .describe(
            'true = set/replace the post cover (post must exist). false (default) = store an inline image and return image.html for the article body.',
          ),
        index: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe('Inline slot number (inline/<slug>-<index>). Omit to use the next free slot.'),
        altText: z
          .string()
          .optional()
          .describe('img alt text for the returned <figure>, usually the section heading'),
        ...imageInputs,
      },
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    async ({ slug, attachToPost, index, altText, imageQuery, imageId, imageUrl }) => {
      try {
        const data = await callApi(env, '/images', {
          method: 'POST',
          body: {
            slug,
            query: imageQuery,
            imageId,
            imageUrl,
            index,
            altText,
            attachToPost: attachToPost === true,
          },
        })
        return result(data)
      } catch (error) {
        return failure(error)
      }
    },
  )

  return server
}

/* ------------------------------------------------------------------ */
/* worker entry                                                        */
/* ------------------------------------------------------------------ */

let cached = null

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': 'authorization, content-type, mcp-session-id',
          'access-control-expose-headers': 'mcp-session-id',
          'access-control-max-age': '86400',
        },
      })
    }

    if (url.pathname === '/' || url.pathname === '/health') {
      return json({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        protocol: 'MCP 2026-07-28 (Streamable HTTP)',
        endpoint: `${url.origin}/mcp`,
        tools: [
          'list_posts',
          'get_post',
          'create_post',
          'update_post',
          'delete_post',
          'search_images',
          'import_image',
        ],
      })
    }

    if (url.pathname !== '/mcp') {
      return json({ error: 'Not found. The MCP endpoint is /mcp.' }, 404)
    }

    // The endpoint is public, so require a bearer token before the handler runs.
    if (!env.MCP_TOKEN) {
      return json({ error: 'MCP_TOKEN secret is not configured on this Worker' }, 500)
    }

    const authorization = request.headers.get('authorization') || ''
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''

    if (!token || !(await safeEqual(token, env.MCP_TOKEN))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'www-authenticate': 'Bearer realm="bloggy-mcp"',
        },
      })
    }

    // Stateless handler: one fresh McpServer per request, env captured per isolate.
    if (!cached) {
      cached = createMcpHandler(() => buildServer(env), { responseMode: 'json' })
    }

    const response = await cached.fetch(request)
    const headers = new Headers(response.headers)
    headers.set('access-control-allow-origin', '*')
    headers.set('access-control-expose-headers', 'mcp-session-id')
    return new Response(response.body, { status: response.status, headers })
  },
}
