export async function onRequest(context) {
  const { request, env } = context;

  // CORS 跨域头部
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // 处理预检 OPTIONS 请求
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 只允许 POST
  if (request.method !== "POST") {
    return Response.json(
      { success: false, errMsg: "仅支持POST请求" },
      { headers: corsHeaders }
    );
  }

  try {
    // 读取环境变量，清理URL末尾斜杠
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_KEY;

    if (!baseUrl) throw new Error("环境变量缺失：SUPABASE_URL");
    if (!serviceKey) throw new Error("环境变量缺失：SUPABASE_SERVICE_KEY");

    // 只解析一次请求体
    const { name, phone, content } = await request.json();

    // 拼接 Supabase REST 接口地址
    const apiUrl = `${baseUrl}/rest/v1/feedback`;

    // 请求 Supabase 写入数据
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ name, phone, content })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(`Supabase错误：${JSON.stringify(errData)}`);
    }

    return Response.json(
      { success: true, msg: "提交成功" },
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error("提交失败:", err);
    return Response.json(
      { success: false, errMsg: err.message || "服务器内部错误" },
      { headers: corsHeaders, status: 500 }
    );
  }
}
