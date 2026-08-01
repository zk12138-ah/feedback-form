export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 跨域预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 仅允许POST
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method Not Allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;
  try {
    const payload = await request.json();
    const token = payload.token;

    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET);
    formData.append("response", token);

    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData
    });
    const result = await resp.json();
    return Response.json(result, { headers: corsHeaders });
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
