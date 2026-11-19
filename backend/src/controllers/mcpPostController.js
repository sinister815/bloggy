/**
 * Post CRUD for the MCP server.
 *
 * Unlike the browser-facing controllers these are not limited to the author of
 * a post: the MCP key is a trusted admin credential, so it may list drafts,
 * edit any post and delete any post. Routes are mounted under /api/mcp and are
 * always behind mcpAuth.
 */
import Post from '../models/postModel.js'
import { deleteAsset, deletePostImages, renameForSlug } from '../utils/imageStore.js'
import { resolvePixabayCover } from '../utils/pixabay.js'

const LIMIT_MAX = 50
const MAX_CONTENT_CHARS = 300_000

const stripHtml = (html = '') =>
  String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const fail = (res, err) =>
  res.status(err.status || (err.code === 11000 ? 400 : 500)).json({
    success: false,
    message: err.code === 11000 ? 'Slug already exists' : err.message,
  })

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean)
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  return undefined
}

const summary = (post) => ({
  id: post._id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  category: post.category,
  tags: post.tags,
  status: post.status,
  coverImage: post.featuredImage?.url || null,
  author: post.userId?.name || null,
  views: post.views || 0,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
})

const hasImageInput = (body) =>
  Boolean(body.imageQuery || body.imageId || body.imageUrl)

/** Maps the tool-facing field names onto the Pixabay helper's arguments. */
const coverInput = (body, slug) => ({
  imageUrl: body.imageUrl,
  imageId: body.imageId,
  query: body.imageQuery,
  slug,
})

/**
 * The body is ~20k characters per long article, so it is only echoed when the
 * caller explicitly asks for it — every other tool reply stays small.
 */
const replyPost = (post, includeContent = false) => {
  const payload = typeof post.toObject === 'function' ? post.toObject() : { ...post }
  payload.contentLength = String(payload.content || '').length
  if (!includeContent) {
    delete payload.content
    payload.contentOmitted = true
  }
  return payload
}

const countOccurrences = (haystack, needle) =>
  !needle ? 0 : String(haystack).split(String(needle)).length - 1

/** Recomputes the excerpt unless the caller supplied one. */
const refreshExcerpt = (post, explicitExcerpt) => {
  post.excerpt = explicitExcerpt || stripHtml(post.content).slice(0, 160)
}

// @desc    List posts of every status (paged)
// @route   GET /api/mcp/posts
export const listPosts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), LIMIT_MAX)
    const status = String(req.query.status || 'all').toLowerCase()
    const search = String(req.query.search || '').trim()

    const filter = {}
    if (status === 'active' || status === 'inactive') filter.status = status
    if (search) filter.$text = { $search: search }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email'),
      Post.countDocuments(filter),
    ])

    res.json({
      success: true,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
      status,
      rows: posts.map(summary),
    })
  } catch (err) {
    fail(res, err)
  }
}

// @desc    Read one post of any status, content included
// @route   GET /api/mcp/posts/:slug
export const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate('userId', 'name email')
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    res.json({ success: true, post })
  } catch (err) {
    fail(res, err)
  }
}

// @desc    Create a post, optionally with a Pixabay cover
// @route   POST /api/mcp/posts
export const createPost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, category, status } = req.body || {}
    const tags = parseTags(req.body?.tags)

    if (!title || !slug || !content) {
      return res
        .status(400)
        .json({ success: false, message: 'title, slug and content are required' })
    }

    const cover = hasImageInput(req.body)
      ? await resolvePixabayCover(coverInput(req.body, slug))
      : undefined

    let post
    try {
      post = await Post.create({
        title,
        slug,
        content,
        excerpt: excerpt || stripHtml(content).slice(0, 160),
        tags: tags || [],
        category: category || 'general',
        status: status === 'inactive' ? 'inactive' : 'active',
        ...(cover && { featuredImage: cover }),
        userId: req.user._id,
      })
    } catch (err) {
      // Duplicate slug / validation failure: do not leave an orphan Cloudinary asset.
      if (cover?.publicId) await deleteAsset(cover.publicId)
      throw err
    }

    const populated = await Post.findById(post._id).populate('userId', 'name email')
    res.status(201).json({
      success: true,
      post: replyPost(populated, req.body?.includeContent === true),
    })
  } catch (err) {
    fail(res, err)
  }
}

// @desc    Partial update of any post, optionally replacing its cover
// @route   PATCH /api/mcp/posts/:slug
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    const body = req.body || {}
    const tags = parseTags(body.tags)

    const sendsContent = body.content !== undefined
    const sendsAppend = typeof body.contentAppend === 'string'
    const sendsReplace = Boolean(body.contentReplace && typeof body.contentReplace === 'object')

    // One content mode per call keeps the result unambiguous.
    if ([sendsContent, sendsAppend, sendsReplace].filter(Boolean).length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Send only one of content, contentAppend or contentReplace per call',
      })
    }

    if (body.title !== undefined) post.title = body.title
    if (body.slug !== undefined) post.slug = String(body.slug)
    if (body.category !== undefined) post.category = body.category
    if (body.status !== undefined) {
      post.status = body.status === 'inactive' ? 'inactive' : 'active'
    }
    if (tags !== undefined) post.tags = tags

    const oldSlug = req.params.slug
    let applied = null

    if (sendsContent) {
      post.content = String(body.content)
      applied = { mode: 'content', contentLength: post.content.length }
    } else if (sendsAppend) {
      const chunk = body.contentAppend
      if (!chunk.trim()) {
        return res
          .status(400)
          .json({ success: false, message: 'contentAppend is empty' })
      }
      // Retry-safe: appending the same chunk twice is a no-op, not a duplicate.
      if (post.content.trimEnd().endsWith(chunk.trim())) {
        applied = { mode: 'append', appended: 0, duplicate: true }
      } else {
        const next = `${post.content}\n${chunk}`
        if (next.length > MAX_CONTENT_CHARS) {
          return res.status(400).json({
            success: false,
            message: `content would exceed ${MAX_CONTENT_CHARS} characters (${next.length})`,
          })
        }
        post.content = next
        applied = { mode: 'append', appended: chunk.length }
      }
    } else if (sendsReplace) {
      const find = String(body.contentReplace.find ?? '')
      const replace = String(body.contentReplace.replace ?? '')
      const all = body.contentReplace.all === true

      if (!find) {
        return res
          .status(400)
          .json({ success: false, message: 'contentReplace.find is required' })
      }

      const occurrences = countOccurrences(post.content, find)
      if (!occurrences) {
        return res.status(400).json({
          success: false,
          message:
            'contentReplace.find was not found. The match is exact (spaces/newlines included); ' +
            'call get_post and copy the snippet verbatim.',
        })
      }
      if (occurrences > 1 && !all) {
        return res.status(400).json({
          success: false,
          message:
            `contentReplace.find matched ${occurrences} times. Use a longer unique snippet ` +
            'or pass all: true.',
        })
      }

      // Literal replacement: split/join avoids `$&` and regex surprises.
      const next = all
        ? post.content.split(find).join(replace)
        : (() => {
            const at = post.content.indexOf(find)
            return post.content.slice(0, at) + replace + post.content.slice(at + find.length)
          })()

      if (next.length > MAX_CONTENT_CHARS) {
        return res.status(400).json({
          success: false,
          message: `content would exceed ${MAX_CONTENT_CHARS} characters (${next.length})`,
        })
      }

      post.content = next
      applied = { mode: 'replace', replaced: all ? occurrences : 1 }
    }

    if (sendsContent || sendsAppend || sendsReplace) {
      refreshExcerpt(post, body.excerpt)
    } else if (body.excerpt !== undefined) {
      post.excerpt = body.excerpt
    }

    let coverReplaced = false
    if (hasImageInput(body)) {
      const previousPublicId = post.featuredImage?.publicId
      const cover = await resolvePixabayCover(coverInput(body, body.slug || post.slug))
      post.featuredImage = cover
      coverReplaced = true
      if (previousPublicId && previousPublicId !== cover.publicId) {
        await deleteAsset(previousPublicId)
      }
    } else if (body.removeImage === true && post.featuredImage?.publicId) {
      await deleteAsset(post.featuredImage.publicId)
      post.featuredImage = undefined
    }

    // Save first: a duplicate-slug failure must not rename the asset.
    await post.save()

    // Slug changed: keep the Cloudinary asset name equal to the slug. The old
    // asset still exists here, so a rename failure leaves a working image.
    let renamed = false
    if (post.slug !== oldSlug && !coverReplaced && post.featuredImage?.publicId) {
      const rename = await renameForSlug({
        publicId: post.featuredImage.publicId,
        newSlug: post.slug,
      })
      if (rename?.renamed) {
        post.featuredImage.publicId = rename.publicId
        if (rename.url) post.featuredImage.url = rename.url
        await post.save()
        renamed = true
      }
    }

    const populated = await Post.findById(post._id).populate('userId', 'name email')
    res.json({
      success: true,
      updated: true,
      applied,
      imageRenamed: renamed,
      contentLength: String(populated.content || '').length,
      post: replyPost(populated, body.includeContent === true),
    })
  } catch (err) {
    fail(res, err)
  }
}

// @desc    Delete any post, its cover and its inline images
// @route   DELETE /api/mcp/posts/:slug
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    await deletePostImages({
      slug: post.slug,
      coverPublicId: post.featuredImage?.publicId,
    })
    await post.deleteOne()

    res.json({ success: true, message: `Deleted "${post.title}"`, slug: post.slug })
  } catch (err) {
    fail(res, err)
  }
}
