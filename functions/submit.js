export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

  // 处理跨域 OPTIONS 预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  try {
    const payload = await request.json();
    // ！！！把下方 table_name 替换成你Supabase真实数据表名称
    const table = "feedback";

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return Response.json({ success: false, msg: errorText }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return Response.json({ success: true, msg: "提交成功" }, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return Response.json({ success: false, msg: err.message }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
