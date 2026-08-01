export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json({ success: false, msg: "仅支持POST请求" }, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = env.SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl) throw new Error("缺失环境变量：SUPABASE_URL");
    if (!serviceKey) throw new Error("缺失环境变量：SUPABASE_SERVICE_KEY");

    const { name, phone, content } = await request.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/feedback`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        name,
        phone,
        content
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Supabase错误：${JSON.stringify(data)}`);

    return Response.json({ success: true }, { headers: corsHeaders });

  } catch (err) {
    return Response.json(
      { success: false, errMsg: err.message },
      { status: 200, headers: corsHeaders }
    );
  }
}
