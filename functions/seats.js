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
    console.log("SUPABASE_URL是否加载:", !!SUPABASE_URL);
    console.log("SUPABASE_ANON_KEY是否加载:", !!SUPABASE_ANON_KEY);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/seats?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const rawData = await res.json();
    console.log("Supabase原始返回数据：", rawData);

    if (!Array.isArray(rawData)) {
      throw new Error(`数据库返回非数组，原始返回内容：${JSON.stringify(rawData)}`);
    }

    let available = 0;
    let occupied = 0;
    rawData.forEach(item => {
      if (item.status === "available") available++;
      if (item.status === "occupied") occupied++;
    });

    return Response.json({
      success: true,
      total: rawData.length,
      available,
      occupied,
      list: rawData
    }, { headers: corsHeaders });

  } catch (err) {
    return Response.json({ success: false, errMsg: err.message }, { status: 500, headers: corsHeaders });
  }
}
