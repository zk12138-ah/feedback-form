export default async function handler(req, res) {
  // 处理跨域 OPTIONS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, msg: "请求方式错误" });
  }

  try {
    const { token } = req.body;
    // ⚠️填入你的Cloudflare Turnstile Secret Key
    const SECRET_KEY = "0x4AAAAAAEC6miU5NB6sZ11rLz6koXDZXwI";

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: SECRET_KEY,
        response: token
      })
    });

    const result = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, msg: "服务器验证异常" });
  }
}
