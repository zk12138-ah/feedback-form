export async function onRequest(context) {
  const targetUrl = "https://challenges.cloudflare.com/turnstile/v0/site.js";
  try {
    const res = await fetch(targetUrl);
    // 复制原始响应头
    const newHeaders = new Headers(res.headers);
    // 移除不安全的来源头，避免冲突
    newHeaders.delete("origin");
    return new Response(res.body, {
      status: res.status,
      headers: newHeaders
    });
  } catch (err) {
    return Response.json({
      success: false,
      msg: "Turnstile脚本代理获取失败",
      error: err.message
    }, { status: 502 });
  }
}
