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
    const url = new URL(request.url);
    const inputPwd = url.searchParams.get("password");
    const realPwd = env.ADMIN_PASSWORD;
    const isAdmin = inputPwd && inputPwd === realPwd;

    if (inputPwd && !isAdmin) {
      return Response.json(
        { success: false, errMsg: "权限验证失败" },
        { headers: corsHeaders, status: 403 }
      );
    }

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

    if (isAdmin) {
      // 管理员：返回完整全部数据
      return Response.json(
        { success: true, total, available, occupied, list: data },
        { headers: corsHeaders }
      );
    } else {
      // 公开用户：新增返回占用时间，隐藏客户编号等敏感信息
      const publicList = data.map(item => ({
        seat_no: item.seat_no,
        status: item.status,
        pos_x: item.pos_x,
        pos_y: item.pos_y,
        area: item.area,
        occupy_start: item.occupy_start,
        occupy_end: item.occupy_end
      }));
      return Response.json(
        { success: true, total, available, occupied, list: publicList },
        { headers: corsHeaders }
      );
    }

  } catch (err) {
    console.error("获取座位状态失败:", err);
    return Response.json(
      { success: false, errMsg: err.message || "服务器内部错误" },
      { headers: corsHeaders, status: 500 }
    );
  }
}
