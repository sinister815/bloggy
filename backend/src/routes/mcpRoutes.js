import { Router } from 'express'
import { mcpAuth } from '../middlewares/mcpAuth.js'
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/mcpPostController.js'
import { searchImages, importImage } from '../controllers/mcpImageController.js'

const router = Router()

// Every MCP route requires the x-api-key header.
router.use(mcpAuth)

router.get('/posts', listPosts)
router.get('/posts/:slug', getPost)
router.post('/posts', createPost)
router.patch('/posts/:slug', updatePost)
router.delete('/posts/:slug', deletePost)

router.get('/images', searchImages)
router.post('/images', importImage)

export default router
