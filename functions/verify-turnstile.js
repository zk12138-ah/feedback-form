export async function onRequest(context) {
  const { request, env } = context;
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 处理OPTIONS预检
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // GET/直接浏览器访问，输出测试标记，用来确认代码是否生效
  if (request.method !== "POST") {
    return Response.json(
      {
        version: "NEW_CODE_20260801",
        tip: "当前函数已成功加载新版代码，请使用POST请求验证turnstile",
        receiveMethod: request.method
      },
      { status: 405, headers: corsHeaders }
    );
  }

  // POST正式校验逻辑
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
    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
