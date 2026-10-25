import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cloudinary from './cloudinary.js'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Upload buffer to Cloudinary, return { url, publicId }
export const uploadToCloudinary = async (file, folder = 'bloggy') => {
  const result = await cloudinary.uploader.upload(file.path, { folder })
  return { url: result.secure_url, publicId: result.public_id }
}

// Multer storage: keep file in an uploads dir (create it on first run)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `${unique}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  },
})