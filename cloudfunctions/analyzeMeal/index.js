const cloudbase = require('@cloudbase/node-sdk');
const { validateInput, validateAnalysis } = require('./policy');
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const { SYSTEM_PROMPT } = require('./prompt');
async function reserveCall() {
  const limit = Number(process.env.DEMO_AI_DAILY_LIMIT || 0);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw new Error('演示 AI 尚未开放调用额度');
  const day = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
  await db.runTransaction(async transaction => {
    const ref = transaction.collection('sunny_island_demo_usage').doc(`meal-${day}`);
    const result = await ref.get();
    const record = Array.isArray(result.data) ? result.data[0] : result.data;
    const count = record?.count || 0;
    if (count >= limit) throw new Error('今天的演示分析次数已用完，明天再来看看');
    await ref.set({ count:count+1,day });
  });
}
exports.main = async (event, context) => {
  let timer;
  try {
    const { uid } = await app.auth().getAuthContext(context);
    if (!uid) return {ok:false,message:'请先连接演示空间'};
    const input = validateInput(event);
    const apiKey = process.env.FOOD_AI_API_KEY;
    const model = process.env.FOOD_AI_MODEL;
    const baseUrl = (process.env.FOOD_AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/,'');
    if (!apiKey || !model) return {ok:false,message:'演示模型尚未配置，餐食记录仍可使用'};
    if (!baseUrl.startsWith('https://')) throw new Error('模型接口配置不正确');
    await reserveCall();
    const content=[{type:'text',text:input.description || '请观察这张餐食照片。'}];
    if (input.imageDataUrl) content.push({type:'image_url',image_url:{url:input.imageDataUrl,detail:'low'}});
    const controller = new AbortController();
    timer = setTimeout(()=>controller.abort(),25000);
    const response = await fetch(`${baseUrl}/chat/completions`,{
      method:'POST',signal:controller.signal,
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},
      body:JSON.stringify({model,temperature:.25,max_tokens:1000,response_format:{type:'json_object'},messages:[{role:'system',content:SYSTEM_PROMPT},{role:'user',content}]})
    });
    if (!response.ok) return {ok:false,message:`模型服务暂时不可用（${response.status}），请稍后重试`};
    const result=await response.json();
    const raw=String(result.choices?.[0]?.message?.content || '').replace(/^```json\s*/i,'').replace(/```$/,'').trim();
    return {ok:true,analysis:validateAnalysis(JSON.parse(raw))};
  } catch(error) {
    const message=error instanceof Error ? error.message : '';
    return {ok:false,message:error?.name==='AbortError'?'分析等待时间较长，请稍后重试':/请|演示|模型|今天/.test(message)?message:'分析暂未完成，请重试'};
  } finally { if(timer) clearTimeout(timer); }
};
