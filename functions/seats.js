export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const inputPwd = url.searchParams.get("password");
    const realPwd = env.ADMIN_PASSWORD;

    if (!inputPwd || inputPwd !== realPwd) {
      return Response.json({ success: false, errMsg: "权限验证失败" }, { status: 403, headers: corsHeaders });
    }

    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/seat?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const list = await res.json();

    // ✅ 核心修复：强制判断list是否为数组
    if (!Array.isArray(list)) {
      throw new Error("数据库返回数据格式异常，请检查表名/连接");
    }

    let available = 0;
    let occupied = 0;
    list.forEach(item => {
      if (item.status === "available") available++;
      if (item.status === "occupied") occupied++;
    });

    return Response.json({
      success: true,
      total: list.length,
      available,
      occupied,
      list
    }, { headers: corsHeaders });

  } catch (err) {
    return Response.json({ success: false, errMsg: err.message }, { status: 500, headers: corsHeaders });
  }
}
