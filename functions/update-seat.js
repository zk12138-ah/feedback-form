export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { seat_no, status, password, customer_id, occupy_start, occupy_end } = body;
    const realPwd = env.ADMIN_PASSWORD;

    // 密码校验核心
    if (!password || password !== realPwd) {
      return Response.json({ success: false, errMsg: "权限验证失败" }, { status: 403, headers: corsHeaders });
    }

    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

    const updateData = { status };
    // 如果传入客户信息，一并更新
    if (customer_id) {
      updateData.customer_id = customer_id;
      updateData.occupy_start = occupy_start;
      updateData.occupy_end = occupy_end;
    } else {
      // 设置为可选/维护时，清空客户信息
      updateData.customer_id = null;
      updateData.occupy_start = null;
      updateData.occupy_end = null;
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/seat?seat_no=eq.${seat_no}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(updateData)
    });

    if (!resp.ok) throw new Error("数据库更新失败");

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ success: false, errMsg: err.message }, { status: 500, headers: corsHeaders });
  }
}
