export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 处理预检OPTIONS
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json({ success: false, msg: "仅支持POST" }, { status:405, headers:corsHeaders });
  }

  try {
    // 先打印环境变量是否存在（调试关键）
    const supabaseUrl = env.SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl) throw new Error("环境变量缺失：SUPABASE_URL");
    if (!serviceKey) throw new Error("环境变量缺失：SUPABASE_SERVICE_KEY");

    const payload = await request.json();
    const { name, phone, content } = payload;

    const res = await fetch(`${supabaseUrl}/rest/v1/feedback`, {
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
        content,
        create_time: new Date().toISOString()
      })
    });

    const data = await res.json();
    if (!res.ok) {
      // 把Supabase返回的数据库错误抛出
      throw new Error(`Supabase API错误: ${JSON.stringify(data)}`);
    }

    return Response.json({ success:true, data }, { headers:corsHeaders });

  } catch (err) {
    // ✅重点：把完整错误信息返回前端弹窗
    return Response.json(
      { success: false, error_detail: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
