export default async function handler(req, res) {
  // 跨域 OPTIONS 预检处理
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  // 仅允许POST请求
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, msg: "仅支持POST请求" });
  }

  try {
    const { name, phone, content } = req.body;

    // ===================== Supabase 配置区 =====================
    // 建议在Vercel环境变量配置，不要明文写在这里！
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
    // ==========================================================

    // 初始化supabase客户端
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 插入数据（修改table_name为你真实的数据表名）
    const { error } = await supabase
      .from("feedback") // ⚠️【重要】替换成你在Supabase里的表名！
      .insert([
        {
          name: name,
          phone: phone,
          content: content,
          create_time: new Date() // 如果你的表有创建时间字段
        }
      ]);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      success: true,
      msg: "提交成功！"
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: "服务器异常：" + e.message
    });
  }
}
