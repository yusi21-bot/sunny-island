const crypto = require('node:crypto');
exports.roomId = token => {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new Error('演示空间链接无效');
  return crypto.createHash('sha256').update(token).digest('hex');
};
exports.checkState = state => {
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('状态格式不正确');
  for (const key of ['statuses','tasks','schedule','messages','activity']) {
    if (!Array.isArray(state[key]) || state[key].length > 500) throw new Error('演示记录格式或数量超出限制');
  }
  if (!state.habits || !state.island || !['brother','sister','mom'].includes(state.currentUser)) throw new Error('缺少家庭状态');
  if (Buffer.byteLength(JSON.stringify(state)) > 850000) throw new Error('演示空间已接近容量，请减少照片后再同步');
  return state;
};
