exports.validateInput = event => {
  const description = typeof event?.description === 'string' ? event.description.trim() : '';
  const imageDataUrl = event?.imageDataUrl;
  if (description.length > 1200) throw new Error('补充说明请控制在 1200 字以内');
  if (imageDataUrl && (typeof imageDataUrl !== 'string' || imageDataUrl.length > 1600000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(imageDataUrl))) throw new Error('请上传较小的 JPG、PNG 或 WebP 图片');
  if (!description && !imageDataUrl) throw new Error('请先填写菜名或上传餐食照片');
  return { description, imageDataUrl };
};
exports.validateAnalysis = value => {
  const list = (value,max=8) => Array.isArray(value) && value.length <= max && value.every(x=>typeof x==='string' && x.length <= 400);
  if (!value || !list(value.dishes) || !list(value.strengths) || !list(value.cautions)) throw new Error('模型结果格式不完整，请重试');
  if (!Array.isArray(value.nutrition) || value.nutrition.length > 8 || !value.nutrition.every(x=>x && typeof x.name==='string' && x.name.length<=40 && ['充足','适中','偏少','偏多'].includes(x.level) && typeof x.note==='string' && x.note.length<=400)) throw new Error('模型结果格式不完整，请重试');
  for (const key of ['suggestion','familyNote']) if (typeof value[key]!=='string' || value[key].length>600) throw new Error('模型结果格式不完整，请重试');
  return { dishes:value.dishes,nutrition:value.nutrition,strengths:value.strengths,cautions:value.cautions,suggestion:value.suggestion,familyNote:value.familyNote,estimatedCalories:typeof value.estimatedCalories==='string'?value.estimatedCalories.slice(0,80):'无法可靠估算' };
};
