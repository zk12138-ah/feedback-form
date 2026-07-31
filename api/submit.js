export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({msg:"仅支持POST"});
  }
 
  const SUPABASE_KEY = "sb_publishable_yoLE7CK9nOuQYdIv8R_vng_43ba_Ffu";

  const {name, phone, content} = req.body;
  if(!name || !content){
    return res.status(400).json({msg:"姓名和反馈内容必填"});
  }

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/feedback`,{
      method:"POST",
      headers:{
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type":"application/json",
        "Prefer":"return=minimal"
      },
      body: JSON.stringify({name,phone,content})
    })
    if(resp.ok){
      return res.status(200).json({success:true});
    }else{
      return res.status(400).json({success:false,msg:"存储失败"});
    }
  }catch(e){
    return res.status(500).json({success:false,msg:"网络异常"});
  }
}
