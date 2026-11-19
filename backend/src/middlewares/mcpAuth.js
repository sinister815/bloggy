import { createHash, timingSafeEqual } from 'node:crypto'
import mongoose from 'mongoose'

// Hash both sides so the comparison is constant-time and length-independent.
const safeEqual = (left, right) => {
  const a = createHash('sha256').update(String(left ?? '')).digest()
  const b = createHash('sha256').update(String(right ?? '')).digest()
  return timingSafeEqual(a, b)
}

export const mcpAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  const expectedKey = process.env.MCP_API_KEY

  if (!expectedKey) {
    return res.status(503).json({
      success: false,
      message: 'MCP_API_KEY is not configured on the API server',
    })
  }

  if (!apiKey || !safeEqual(apiKey, expectedKey)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing MCP API Key',
    })
  }

  // Mock user object to satisfy createPost's req.user._id
  // User must provide MCP_ADMIN_USER_ID in .env (a valid MongoDB ObjectId)
  const adminId = process.env.MCP_ADMIN_USER_ID

  if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
    return res.status(503).json({
      success: false,
      message: 'MCP_ADMIN_USER_ID must be a valid MongoDB ObjectId',
    })
  }

  req.user = {
    _id: adminId,
    name: 'MCP Agent',
    email: 'mcp@agent.local'
  }

  next()
}
