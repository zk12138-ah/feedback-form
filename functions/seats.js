export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 处理跨域预检
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    // 从url参数获取密码 ?password=xxx
    const inputPwd = url.searchParams.get("password");
    const realPwd = env.ADMIN_PASSWORD;

    if (!inputPwd || inputPwd !== realPwd) {
      return Response.json({ success: false, errMsg: "权限验证失败" }, { status: 403, headers: corsHeaders });
    }

    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

    // 查询座位表
    const res = await fetch(`${SUPABASE_URL}/rest/v1/seat?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const list = await res.json();

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
