import { Router } from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} from '../controllers/userController.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.put('/me', protect, updateProfile)

export default router