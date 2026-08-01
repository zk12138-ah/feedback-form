export async function onRequest(context) {
  const { request, next } = context;
  // 处理OPTIONS预检请求
  if (request.method === "OPTIONS") {
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
  const response = await next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}
