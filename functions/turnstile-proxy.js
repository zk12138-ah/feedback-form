export async function onRequest(context) {
  const targetUrl = "https://challenges.cloudflare.com/turnstile/v0/site.js";
  
  try {
    // 从Cloudflare服务器端请求（服务器网络可以正常访问）
    const upstream = await fetch(targetUrl, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Cloudflare-Pages-Proxy"
      }
    });

    // 获取原始JS内容
    const jsContent = await upstream.text();
    
    // 返回正确的JavaScript内容，强制设置Content-Type
    return new Response(jsContent, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (err) {
    return new Response(`console.error("Turnstile代理加载失败:", "${err.message}")`, {
      status: 200,
      headers: { "Content-Type": "application/javascript" }
    });
  }
}
