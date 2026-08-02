export async function onRequest(context) {
  const targetUrl = "https://challenges.cloudflare.com/turnstile/v0/site.js";
  
  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (compatible; Cloudflare-Pages-Proxy)"
      }
    });

    const status = upstream.status;
    const contentType = upstream.headers.get("content-type") || "";
    const content = await upstream.text();

    // 请求成功则返回正常JS
    if (upstream.ok && contentType.includes("javascript")) {
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    // 请求失败则返回调试信息
    return new Response(
      `===== 代理调试信息 =====\n` +
      `目标地址: ${targetUrl}\n` +
      `响应状态码: ${status}\n` +
      `Content-Type: ${contentType}\n` +
      `内容长度: ${content.length} 字节\n` +
      `\n----- 响应内容前500字符 -----\n` +
      content.slice(0, 500),
      {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      }
    );

  } catch (err) {
    return new Response(
      `===== 代理请求异常 =====\n` +
      `错误类型: ${err.name}\n` +
      `错误信息: ${err.message}`,
      {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      }
    );
  }
}
