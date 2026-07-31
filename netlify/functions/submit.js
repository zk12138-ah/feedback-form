// Netlify 标准云函数格式，直接覆盖原有文件
exports.handler = async function(event, context) {
  // 仅允许POST请求
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({msg:"仅支持POST请求"})
    }
  }

  const SUPABASE_URL = "https://prcumhtnofzmnyhcavez.supabase.co";
  const SUPABASE_KEY = "sb_publishable_yoLE7CK9nOuQYdIv8R_vng_43ba_Ffu";

  try{
    const body = JSON.parse(event.body);
    const {name, phone, content} = body;

    if(!name || !content){
      return {
        statusCode:400,
        body:JSON.stringify({success:false,msg:"姓名和反馈内容必填"})
      }
    }

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
      return {
        statusCode:200,
        body:JSON.stringify({success:true})
      }
    }else{
      return {
        statusCode:400,
        body:JSON.stringify({success:false,msg:"数据库存储失败"})
      }
    }
  }catch(err){
    console.error(err);
    return {
      statusCode:500,
      body:JSON.stringify({success:false,msg:"服务器异常"})
    }
  }
}
