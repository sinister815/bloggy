import { Router } from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
} from '../controllers/postController.js'

const router = Router()

router.get('/', getPosts)
router.get('/me', protect, getMyPosts)
router.get('/:slug', getPostBySlug)
router.post('/', protect, createPost)
router.put('/:slug', protect, updatePost)
router.delete('/:slug', protect, deletePost)

export default router