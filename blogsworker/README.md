# Bloggy MCP server

A real [Model Context Protocol](https://modelcontextprotocol.io) server for Bloggy, running on
Cloudflare Workers over **Streamable HTTP**. It exposes post CRUD plus a Pixabay → Cloudinary
cover-image pipeline, so an MCP client (Claude Desktop/Code, Cursor, MCP Inspector, an agent
platform, …) can manage the blog without touching the database.

Built with **MCP TypeScript SDK v2** (`@modelcontextprotocol/server`, `createMcpHandler`) and
speaks the modern `2026-07-28` per-request envelope, falling back to the 2025-era stateless
`initialize` handshake for older clients.

## Tools

| Tool | What it does |
| --- | --- |
| `list_posts` | Paged list, **all statuses by default** (drafts included), optional text search |
| `get_post` | One post by slug, full HTML body and cover |
| `create_post` | Create a post; optional `imageQuery` / `imageId` / `imageUrl` sets the cover |
| `update_post` | Partial update of any post; `newSlug`, `removeImage`, cover replacement supported |
| `delete_post` | Permanent delete + Cloudinary cleanup; refuses without `confirm: true` |
| `search_images` | Search Pixabay (safe search, ≥1200px, horizontal by default). Nothing is uploaded |
| `import_image` | Copy a Pixabay result into Cloudinary and attach it as an existing post's cover |

Covers are always **copied into Cloudinary** — the website never hot-links Pixabay, and every
import records `featuredImage.credit` (author, page URL, tags) in MongoDB.

## Architecture

```
MCP client ──Bearer MCP_TOKEN──▶ Worker (/mcp)
                                   │  x-api-key: MCP_API_KEY
                                   ▼
                         API  /api/mcp/*
                                   │
                     ┌─────────────┴──────────────┐
                 MongoDB                     Pixabay → Cloudinary
```

Pixabay and Cloudinary credentials live **only on the API server**. The Worker holds just
`MCP_API_KEY` (to call the API) and `MCP_TOKEN` (to authenticate MCP clients).

## Deploy

1. Set the Worker secrets (values are never committed):

   ```bash
   npx wrangler secret put MCP_API_KEY   # same value as the API's MCP_API_KEY
   npx wrangler secret put MCP_TOKEN     # any long random string; clients send it as a bearer token
   ```

   `API_BASE` is already set in `wrangler.toml` to
   `https://bloggy-q1eg.onrender.com/api/mcp`.

   > **Dashboard caveat:** add `MCP_TOKEN` and `MCP_API_KEY` with type **Secret**, never
   > as a plaintext **Variable**. A `wrangler deploy` (including a Git / Workers Builds
   > rebuild) overwrites dashboard Variables with the ones in `wrangler.toml`, so a
   > plaintext `MCP_TOKEN` disappears after the next deploy and `/mcp` answers
   > `500 MCP_TOKEN secret is not configured on this Worker`. Secrets survive deploys.
   > `keep_vars = true` in `wrangler.toml` also protects plaintext dashboard variables.

2. Deploy:

   ```bash
   npm install
   npm run deploy
   ```

   The endpoint becomes `https://<worker-name>.<subdomain>.workers.dev/mcp`.

3. Backend environment (Render) must contain:

   | Variable | Purpose |
   | --- | --- |
   | `MCP_API_KEY` | Shared secret with the Worker |
   | `MCP_ADMIN_USER_ID` | MongoDB ObjectId that owns MCP-created posts |
   | `PIXABAY_API_KEY` | Pixabay API key (free at pixabay.com/api/docs) |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Already used by web uploads |

## Local development

```bash
npm install
npx wrangler dev --var MCP_TOKEN:dev-token --var MCP_API_KEY:<your key>
```

- `http://127.0.0.1:8787/` — server info and tool list
- `http://127.0.0.1:8787/mcp` — MCP endpoint (POST only; a browser will not understand it)

Quick protocol probe:

```bash
curl -s -X POST http://127.0.0.1:8787/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'authorization: Bearer dev-token' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Or use the official inspector: `npx @modelcontextprotocol/inspector@latest`, then connect to
`http://127.0.0.1:8787/mcp` with header `Authorization: Bearer dev-token`.

## Connect a client

```bash
claude mcp add --transport http bloggy https://<worker>.workers.dev/mcp \
  --header "Authorization: Bearer <MCP_TOKEN>"
```

Equivalent JSON for desktop clients:

```json
{
  "mcpServers": {
    "bloggy": {
      "type": "http",
      "url": "https://<worker>.workers.dev/mcp",
      "headers": { "Authorization": "Bearer <MCP_TOKEN>" }
    }
  }
}
```

## Notes

- The endpoint is stateless: a fresh `McpServer` is built per request, so no Durable Object or
  session store is needed and it scales horizontally.
- Pixabay allows 100 requests/minute and asks callers to cache results for 24 hours — call
  `search_images` deliberately, not per keystroke.
- The 2025-era `POST /api/posts/mcp-post` endpoint on the API is kept for backward
  compatibility; new clients should use this server instead.
