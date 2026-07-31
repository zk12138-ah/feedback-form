export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if(req.method !== "POST"){
    return res.status(405).json({success:false,msg:"仅支持POST请求"});
  }

  try {
    const { name, phone, content } = req.body;
    // =========这里保留你原来存储数据逻辑（比如写入sheet、数据库）========
    // 【此处粘贴你原来submit.js里的业务代码】
    
    // 示例成功返回
    return res.status(200).json({success:true,msg:"提交成功"});
  } catch(e){
    return res.status(500).json({success:false,msg:e.message});
  }
}
