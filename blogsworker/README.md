# Bloggy Worker

This Cloudflare Worker acts as a secure proxy to post blogs to your website.

## Setup Instructions

1. **Create KV Namespace**:
   - Go to Cloudflare Dashboard $ightarrow$ Workers & Pages $ightarrow$ KV.
   - Create a namespace named `BLOG_CONFIG`.
   - Copy the **Namespace ID**.

2. **Configure `wrangler.toml`**:
   - Replace `YOUR_KV_NAMESPACE_ID` with the actual ID you copied.

3. **Add Data to KV**:
   Add the following keys to your `BLOG_CONFIG` namespace:
   - `API_ENDPOINT`: `https://bloggy-1-y7he.onrender.com/api/posts/mcp-post`
   - `API_KEY`: Your secret `MCP_API_KEY` (the one you added to Render env).

4. **Deploy**:
   ```bash
   npx wrangler deploy
   ```

## How to use
Send a POST request to your Worker URL with a JSON body:
```json
{
  "title": "My Cloudflare Blog",
  "slug": "cloudflare-blog",
  "content": "Posted via Cloudflare Worker!"
}
```
