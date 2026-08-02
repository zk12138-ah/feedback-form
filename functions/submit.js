export default {
  async onRequest(context) {
    const { request, env } = context;

    // CORS跨域头
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    };

    // 处理OPTIONS预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 只允许POST提交
    if (request.method !== "POST") {
      return Response.json(
        { success: false, errMsg: "请求方式错误，仅支持POST" },
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      // 获取前端表单数据
      const { name, phone, content } = await request.json();

      const SUPABASE_URL = env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

      // 请求Supabase写入数据
      const res = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          name,
          phone,
          content,
          create_time: new Date().toISOString()
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        return Response.json(
          { success: false, errMsg: "Supabase数据库错误：" + errorText },
          { headers: corsHeaders }
        );
      }

      return Response.json(
        { success: true, msg: "反馈提交成功" },
        { headers: corsHeaders }
      );

    } catch (error) {
      return Response.json(
        { success: false, errMsg: "服务器异常：" + error.message },
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
