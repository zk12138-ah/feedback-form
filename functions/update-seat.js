export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 处理跨域OPTIONS预检
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 只允许POST请求
  if (request.method !== "POST") {
    return Response.json(
      { success: false, errMsg: "仅支持POST请求" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { password, seat_no, status } = await request.json();
    const adminPwd = env.ADMIN_PASSWORD;

    // 管理员密码校验
    if (password !== adminPwd) {
      return Response.json(
        { success: false, errMsg: "管理员密码错误" },
        { status: 403, headers: corsHeaders }
      );
    }

    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

    // 更新seat表指定座位状态
    const res = await fetch(`${SUPABASE_URL}/rest/v1/seat?seat_no=eq.${encodeURIComponent(seat_no)}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ status })
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(`Supabase更新失败: ${JSON.stringify(result)}`);
    }

    return Response.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );

  } catch (err) {
    return Response.json(
      { success: false, errMsg: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
