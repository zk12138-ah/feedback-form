export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // 处理预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return Response.json(
      { success: false, errMsg: "仅支持POST请求" },
      { headers: corsHeaders, status: 405 }
    );
  }

  try {
    const { seat_no, status, password } = await request.json();

    // 校验管理员密码
    const adminPwd = env.ADMIN_PASSWORD;
    if (!adminPwd || password !== adminPwd) {
      return Response.json(
        { success: false, errMsg: "管理员密码错误，无权修改座位状态" },
        { headers: corsHeaders, status: 403 }
      );
    }

    // 校验参数
    if (!seat_no || !status) {
      return Response.json(
        { success: false, errMsg: "缺少座位编号或状态参数" },
        { headers: corsHeaders, status: 400 }
      );
    }

    const allowedStatus = ["available", "occupied", "maintenance"];
    if (!allowedStatus.includes(status)) {
      return Response.json(
        { success: false, errMsg: "状态值不合法" },
        { headers: corsHeaders, status: 400 }
      );
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_KEY;

    // 调用 Supabase 更新座位状态
    const apiUrl = `${baseUrl}/rest/v1/seats?seat_no=eq.${encodeURIComponent(seat_no)}`;
    const res = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(`Supabase更新失败：${JSON.stringify(errData)}`);
    }

    return Response.json(
      { success: true, msg: "座位状态更新成功" },
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error("更新座位状态失败:", err);
    return Response.json(
      { success: false, errMsg: err.message || "服务器内部错误" },
      { headers: corsHeaders, status: 500 }
    );
  }
}
