exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({success:false}) };
    }
    const { token } = JSON.parse(event.body);
    // 填入你Cloudflare后台的Secret Key
    const SECRET_KEY = "在此粘贴你的Secret Key";

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            secret: SECRET_KEY,
            response: token
        })
    });
    const data = await res.json();
    return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(data)
    }
}
