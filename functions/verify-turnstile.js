export async function onRequest(context) {
  const { request, env } = context;
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json({ success: false, error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  try {
    const { token } = await request.json();
    const formData = new FormData();
    formData.append("secret", TURNSTILE_SECRET);
    formData.append("response", token);

    // 设置fetch超时 8秒
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    // 区分超时错误
    if (err.name === "AbortError") {
      return Response.json({ success: false, error: "Turnstile验证接口请求超时，请重试" }, { status: 504, headers: corsHeaders });
    }
    return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
