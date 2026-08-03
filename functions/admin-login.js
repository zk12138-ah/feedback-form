export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS跨域头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 处理预检OPTIONS
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 限制只允许POST
  if (request.method !== "POST") {
    return Response.json(
      { success: false, errMsg: "仅支持POST请求" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const inputPwd = body.password?.trim();
    const realPwd = env.ADMIN_PASSWORD;

    if (!inputPwd) {
      return Response.json(
        { success: false, errMsg: "请输入密码" },
        { headers: corsHeaders }
      );
    }

    // 密码比对
    if (inputPwd === realPwd) {
      return Response.json(
        { success: true, errMsg: "" },
        { headers: corsHeaders }
      );
    } else {
      return Response.json(
        { success: false, errMsg: "密码错误" },
        { status: 403, headers: corsHeaders }
      );
    }
  } catch (err) {
    return Response.json(
      { success: false, errMsg: "服务器异常" },
      { status: 500, headers: corsHeaders }
    );
  }
}
