import fs from 'fs'
import { Router } from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import cloudinary from '../utils/cloudinary.js'
import { upload } from '../utils/upload.js'

const router = Router()

// Upload a single image to Cloudinary (auth required)
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }
    const folder = process.env.CLOUDINARY_FOLDER || 'bloggy'
    const result = await cloudinary.uploader.upload(req.file.path, { folder })
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  } finally {
    // The file only exists to hand bytes to Cloudinary; don't keep it on disk.
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {})
    }
  }
})

export default router
