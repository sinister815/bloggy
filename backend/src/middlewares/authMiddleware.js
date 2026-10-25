import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// Verify JWT from cookie or Authorization header
export const protect = async (req, res, next) => {
  let token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, access denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is not valid' })
  }
}

// Optional: allow public access, but attach user if token present
export const optionalAuth = async (req, res, next) => {
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '')
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    } catch (e) {
      /* ignore */
    }
  }
  next()
}