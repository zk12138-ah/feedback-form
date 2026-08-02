export async function onRequest(context) {
  // ✅ 官方正确地址：api.js
  const targetUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  
  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (compatible; Cloudflare-Pages-Proxy)"
      }
    });

    if (!upstream.ok) {
      throw new Error(`上游请求失败，状态码：${upstream.status}`);
    }

    const jsContent = await upstream.text();
    return new Response(jsContent, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (err) {
    return new Response(
      `console.error("Turnstile代理加载失败:", "${err.message}")`,
      {
        status: 200,
        headers: { "Content-Type": "application/javascript" }
      }
    );
  }
}
