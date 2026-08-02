export async function onRequest(context) {
  const { request, env } = context;
  console.log("SUPABASE_URL:",env.SUPABASE_URL);
  console.log("SUPABASE_ANON_KEY:",env.SUPABASE_ANON_KEY);
export async function onRequest(context) {
  const { request, env } = context;

  // CORS 跨域头部
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // 处理预检OPTIONS请求
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 只允许POST
  if (request.method !== "POST") {
    return Response.json(
      { success: false, errMsg: "仅支持POST请求" },
      { headers: corsHeaders }
    );
  }

  try {
    // 清理URL末尾多余斜杠，防止拼接出现双//
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_KEY;

    if (!baseUrl) throw new Error("环境变量缺失：SUPABASE_URL");
    if (!serviceKey) throw new Error("环境变量缺失：SUPABASE_SERVICE_KEY");

    // 读取前端传来的数据
    const payload = await request.json();
    const { name, phone, content } = payload;

    // 拼接正确接口地址
    const apiUrl = `${baseUrl}/rest/v1/feedback`;

    // 请求Supabase写入数据
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        name,
        phone,
        content
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Supabase错误：${JSON.stringify(data)}`);
    }

    return Response.json(
      { success: true, msg: "提交成功" },
      { headers: corsHeaders }
    );

  } catch (err) {
    return Response.json(
      { success: false, errMsg: err.message },
      { status: 200, headers: corsHeaders }
    );
  }
}
