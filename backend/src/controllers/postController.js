import Post from '../models/postModel.js'
import cloudinary from '../utils/cloudinary.js'

// Helper: strip HTML to plain text for excerpt
const stripHtml = (html = '') =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

// Helper: accept only complete Cloudinary image descriptors from the client
const normalizeImage = (image) =>
  image && typeof image === 'object' && image.url && image.publicId
    ? { url: String(image.url), publicId: String(image.publicId) }
    : undefined

// @desc    Get all published posts (paginated)
// @route   GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 60)
    const skip = (page - 1) * limit
    const search = (req.query.search || '').trim()

    const filter = { status: 'active' }
    if (search) {
      filter.$text = { $search: search }
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      Post.countDocuments(filter),
    ])

    res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      rows: posts,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
export const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      'userId',
      'name email',
    )
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    post.views = (post.views || 0) + 1
    await post.save()
    res.json({ success: true, post })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Create post
// @route   POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, tags, category, status, featuredImage } = req.body
    const userId = req.user._id
    const image = normalizeImage(featuredImage)

    if (!title || !slug || !content) {
      return res
        .status(400)
        .json({ success: false, message: 'title, slug and content are required' })
    }

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || stripHtml(content).slice(0, 160),
      tags: Array.isArray(tags) ? tags : [],
      category: category || 'general',
      status: status || 'active',
      ...(image && { featuredImage: image }),
      userId,
    })

    const populated = await Post.findById(post._id).populate('userId', 'name email')
    res.status(201).json({ success: true, post: populated })
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'Slug already exists' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Update post (author only)
// @route   PUT /api/posts/:slug
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to edit this post' })
    }

    const { title, slug, content, excerpt, tags, category, status, featuredImage } = req.body
    const image = normalizeImage(featuredImage)
    const updated = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content, excerpt: excerpt || stripHtml(content).slice(0, 160) }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
        ...(category !== undefined && { category }),
        ...(status !== undefined && { status }),
        ...(image && { featuredImage: image }),
      },
      { new: true, runValidators: true },
    ).populate('userId', 'name email')

    res.json({ success: true, post: updated })
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'Slug already exists' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Delete post (author only)
// @route   DELETE /api/posts/:slug
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to delete this post' })
    }

    // Remove image from Cloudinary if present
    if (post.featuredImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(post.featuredImage.publicId)
      } catch (e) {
        console.warn('Cloudinary delete failed:', e.message)
      }
    }

    await post.deleteOne()
    res.json({ success: true, message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Get my posts (authored by logged-in user)
// @route   GET /api/posts/me
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({
      createdAt: -1,
    })
    res.json({ success: true, rows: posts })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}