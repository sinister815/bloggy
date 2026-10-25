import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/userModel.js'

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// Set cookie
const sendTokenResponse = (res, user, statusCode = 200) => {
  const token = generateToken(user._id)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.status(statusCode).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  })
}

// @desc    Register new user
// @route   POST /api/users/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'name, email and password are required' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' })
    }

    const user = await User.create({ name, email, password })
    sendTokenResponse(res, user, 201)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Login user
// @route   POST /api/users/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' })
    }

    sendTokenResponse(res, user)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Logout user
// @route   POST /api/users/logout
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  })
  res.json({ success: true, message: 'Logged out' })
}

// @desc    Get logged-in user profile
// @route   GET /api/users/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Update profile
// @route   PUT /api/users/me
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    user.name = name || user.name
    user.bio = bio !== undefined ? bio : user.bio
    user.avatar = avatar !== undefined ? avatar : user.avatar
    const updated = await user.save()
    res.json({
      success: true,
      user: { _id: updated._id, name: updated.name, email: updated.email, avatar: updated.avatar, bio: updated.bio },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}