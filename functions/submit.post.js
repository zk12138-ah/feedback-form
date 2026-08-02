export default {
  async onRequest(context) {
    const { request, env } = context;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    try {
      const { name, phone, content } = await request.json();
      const SUPABASE_URL = env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

      const resp = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          name,
          phone,
          content,
          create_time: new Date().toISOString()
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return Response.json({ success: false, msg: errText }, { headers: corsHeaders });
      }
      return Response.json({ success: true, msg: "提交成功" }, { headers: corsHeaders });
    } catch (err) {
      return Response.json({ success: false, msg: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};
