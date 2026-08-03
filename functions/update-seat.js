export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

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
    const body = await request.json();
    const { seat_no, status, password, customer_id, occupy_start, occupy_end } = body;

    // 校验管理员密码
    const adminPwd = env.ADMIN_PASSWORD;
    if (!adminPwd || password !== adminPwd) {
      return Response.json(
        { success: false, errMsg: "管理员密码错误" },
        { headers: corsHeaders, status: 403 }
      );
    }

    if (!seat_no) {
      return Response.json(
        { success: false, errMsg: "缺少座位编号" },
        { headers: corsHeaders, status: 400 }
      );
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_KEY;
    const updateData = { updated_at: new Date().toISOString() };

    // 模式1：直接设置状态
    if (status) {
      const allowed = ["available", "occupied", "maintenance"];
      if (!allowed.includes(status)) {
        return Response.json(
          { success: false, errMsg: "状态值不合法" },
          { headers: corsHeaders, status: 400 }
        );
      }
      updateData.status = status;
      // 设为可选时清空占用信息
      if (status === "available") {
        updateData.customer_id = null;
        updateData.occupy_start = null;
        updateData.occupy_end = null;
      }
    }

    // 模式2：设置占用信息，自动变为已占用
    if (customer_id && occupy_start && occupy_end) {
      updateData.status = "occupied";
      updateData.customer_id = customer_id;
      updateData.occupy_start = occupy_start;
      updateData.occupy_end = occupy_end;
    }

    const apiUrl = `${baseUrl}/rest/v1/seats?seat_no=eq.${encodeURIComponent(seat_no)}`;
    const res = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(updateData)
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
