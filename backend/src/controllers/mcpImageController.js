/**
 * MCP image tools: search Pixabay, and import a result into Cloudinary either
 * as a post cover (attachToPost: true) or as an in-article image (default).
 */
import Post from '../models/postModel.js'
import { deleteAsset } from '../utils/imageStore.js'
import { resolvePixabayCover, resolvePixabayImage, searchPixabay } from '../utils/pixabay.js'

const fail = (res, err) => res.status(err.status || 500).json({ success: false, message: err.message })

// @desc    Search Pixabay images (no side effects)
// @route   GET /api/mcp/images
export const searchImages = async (req, res) => {
  try {
    const images = await searchPixabay({
      query: req.query.q || req.query.query,
      id: req.query.id,
      perPage: req.query.per_page || req.query.perPage,
      page: req.query.page,
      orientation: req.query.orientation || 'horizontal',
    })
    res.json({ success: true, count: images.length, images })
  } catch (err) {
    fail(res, err)
  }
}

// @desc    Import a Pixabay image into Cloudinary (cover or inline)
// @route   POST /api/mcp/images
export const importImage = async (req, res) => {
  try {
    const { slug, imageId, imageUrl, query, index, altText } = req.body || {}
    const attach = req.body?.attachToPost === true

    // The slug is always needed: it is the Cloudinary asset name.
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'slug is required (the Cloudinary asset is named after the post slug)',
      })
    }

    if (!attach) {
      const image = await resolvePixabayImage({
        imageId,
        imageUrl,
        query,
        slug,
        index,
        altText,
      })
      return res.json({ success: true, attachedTo: null, image })
    }

    const post = await Post.findOne({ slug: String(slug).toLowerCase() })
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    // Use the stored slug so `/Foo` and `foo` cannot create two assets.
    const cover = await resolvePixabayCover({ imageId, imageUrl, query, slug: post.slug })
    const previousPublicId = post.featuredImage?.publicId

    post.featuredImage = cover
    await post.save()

    if (previousPublicId && previousPublicId !== cover.publicId) {
      await deleteAsset(previousPublicId)
    }

    res.json({ success: true, attachedTo: post.slug, image: cover })
  } catch (err) {
    fail(res, err)
  }
}
