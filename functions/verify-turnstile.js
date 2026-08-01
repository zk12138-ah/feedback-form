// 处理OPTIONS预检
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// 处理POST
export async function onRequestPost(context) {
  const { request, env } = context;
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;

  try {
    const { token } = await request.json();
    const formData = new FormData();
    formData.append("secret", TURNSTILE_SECRET);
    formData.append("response", token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    return Response.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
