export const mcpAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.MCP_API_KEY;

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or missing MCP API Key' 
    });
  }

  // Mock user object to satisfy createPost's req.user._id
  // User must provide MCP_ADMIN_USER_ID in .env (a valid MongoDB ObjectId)
  req.user = {
    _id: process.env.MCP_ADMIN_USER_ID,
    name: 'MCP Agent',
    email: 'mcp@agent.local'
  };

  next();
};
