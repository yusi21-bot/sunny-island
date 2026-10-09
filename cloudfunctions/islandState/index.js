const cloudbase = require('@cloudbase/node-sdk');
const { roomId, checkState } = require('./policy');
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const first = result => Array.isArray(result.data) ? result.data[0] : result.data;
exports.main = async (event, context) => {
  try {
    const { uid } = await app.auth().getAuthContext(context);
    if (!uid) return { ok:false, message:'请先连接演示空间' };
    const id = roomId(event?.roomToken);
    if (event.action === 'load') {
      const doc = first(await db.collection('sunny_island_demo_state').doc(id).get());
      return { ok:true, state:doc?.state || null, revision:doc?.revision || 0 };
    }
    if (event.action !== 'save') throw new Error('不支持的操作');
    const state = checkState(event.state);
    if (!Number.isSafeInteger(event.revision) || event.revision < 0) throw new Error('版本格式不正确');
    return await db.runTransaction(async transaction => {
      const ref = transaction.collection('sunny_island_demo_state').doc(id);
      const existing = first(await ref.get());
      const revision = existing?.revision || 0;
      if (event.revision !== revision) return { ok:false, conflict:true, message:'另一台设备刚更新了这个空间。本机修改已保留，请刷新后重试；刷新会以云端版本为准。' };
      await ref.set({ state, revision:revision + 1, updatedAt:new Date().toISOString(), schemaVersion:1 });
      return { ok:true, revision:revision + 1 };
    });
  } catch (error) {
    return { ok:false, message: /演示|格式|家庭|操作/.test(error.message) ? error.message : '云端暂时不可用，本机内容仍保留' };
  }
};
