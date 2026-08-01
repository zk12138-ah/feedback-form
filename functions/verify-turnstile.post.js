// functions/verify-turnstile.post.js
export async function onRequestPost(context) {
  const { request, env } = context;
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 处理OPTIONS预检
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. 读取前端发来的所有数据 (同时包含 token 和表单信息)
    const { token, name, phone, content } = await request.json();

    // 2. 验证 Cloudflare Turnstile
    const formData = new FormData();
    formData.append("secret", TURNSTILE_SECRET);
    formData.append("response", token);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData
    });
    const turnstileData = await res.json();

    // 如果人机验证失败了
    if (!turnstileData.success) {
      return Response.json(
        { success: false, msg: "人机验证失败，请刷新重试" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. 【关键】人机验证通过，直接写入 Supabase (合并了你 submit.js 的功能)
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_KEY; // 建议用 ANON_KEY，只要配置了 RLS 即可，SERVICE_KEY 更强大，但要藏好

    const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/feedback`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        name,
        phone,
        content,
        create_time: new Date().toISOString()
      })
    });

    const supabaseResult = await supabaseRes.json();
    
    // 如果写入数据库失败
    if (!supabaseRes.ok) throw new Error(JSON.stringify(supabaseResult));

    // 4. 全部成功，返回前端
    return Response.json(
      { success: true, msg: "提交成功！", data: supabaseResult },
      { headers: corsHeaders }
    );

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
