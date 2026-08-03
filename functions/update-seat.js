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
    // 新增 customer_id、occupy_start、occupy_end 接收
    const { password, seat_no, status, customer_id, occupy_start, occupy_end } = await request.json();
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

    // 动态组装更新内容
    const updatePayload = { status };
    if (customer_id !== undefined) updatePayload.customer_id = customer_id;
    if (occupy_start !== undefined) updatePayload.occupy_start = occupy_start;
    if (occupy_end !== undefined) updatePayload.occupy_end = occupy_end;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/seats?seat_no=eq.${encodeURIComponent(seat_no)}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(updatePayload)
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
