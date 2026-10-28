export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Please send a POST request to post a blog.', { status: 405 });
    }

    try {
      const endpoint = env.API_ENDPOINT;
      const apiKey = env.API_KEY;

      if (!endpoint || !apiKey) {
        return new Response('Configuration missing: API_ENDPOINT or API_KEY environment variables not found.', { status: 500 });
      }

      const body = await request.json();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(body)
      });

      const result = await response.text();

      return new Response(result, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
