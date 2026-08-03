export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return Response.json(
      { success: false, errMsg: "仅支持GET请求" },
      { headers: corsHeaders, status: 405 }
    );
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_KEY;

    if (!baseUrl || !serviceKey) throw new Error("缺少Supabase环境变量");

    const apiUrl = `${baseUrl}/rest/v1/seats?select=*&order=seat_no.asc`;
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(`Supabase查询失败：${JSON.stringify(errData)}`);
    }

    const data = await res.json();
    const total = data.length;
    const available = data.filter(s => s.status === "available").length;
    const occupied = data.filter(s => s.status === "occupied").length;

    return Response.json(
      { success: true, total, available, occupied, list: data },
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error("获取座位状态失败:", err);
    return Response.json(
      { success: false, errMsg: err.message || "服务器内部错误" },
      { headers: corsHeaders, status: 500 }
    );
  }
}
