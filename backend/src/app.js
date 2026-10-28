// Must be the first import: modules below read env vars at evaluation time.
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

import postRoutes from './routes/postRoutes.js'
import userRoutes from './routes/userRoutes.js'
import cloudinaryRoutes from './routes/cloudinaryRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8000

// CORS: comma-separated allow-list from env (Vite may land on 5173 or 5174)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser callers (curl, server-to-server) with no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      callback(null, false)
    },
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded images from disk
const uploadsDir = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(uploadsDir))

// Routes
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/cloudinary', cloudinaryRoutes)

app.get('/', (req, res) => {
  res.send('Bloggy API running')
})

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'alive', timestamp: new Date().toISOString() })
})

// Central error handler
app.use((err, req, res, next) => {
  console.error('API error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
})

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()