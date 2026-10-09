# 技术说明

## 结构

原项目已有 React 页面、CloudBase 接入和餐食分析函数。公开版沿用主要页面与业务逻辑，用 Vite 构建静态前端，将云读写集中到 `islandState` 函数。

```text
src/FamilyIslandApp.tsx    状态与操作
src/data.ts               类型、虚构数据、本机存储
src/cloudSync.ts          登录、云函数、轮询
src/demoRoom.ts           演示空间与同岛链接
src/pages/                五个页面及今日子面板
src/mealImage.ts           图片压缩
src/polish.css             视觉与响应式改进
public/                   黏土素材、三维模型与场景
cloudfunctions/islandState/ 空间读写与版本检查
cloudfunctions/analyzeMeal/ 模型调用与结果校验
tests/policies.test.mjs     输入边界和隔离测试
```

## 同步

浏览器生成随机 256 位空间令牌，或读取同岛链接中的令牌。本机存储按空间分开。匿名登录后，云函数验证登录上下文，并将令牌散列为数据库文档 ID。

首次进入空空间时初始化虚构数据。操作先保存到本机，650 毫秒后合并提交，保存请求串行执行。事务对比版本号，旧版本写入会被拒绝并提示。页面可见时约每 6 秒刷新，窗口恢复焦点或网络恢复时也检查。因此当前是近实时轮询，不是 WebSocket 推送。

空间链接是持有即授权的演示机制；分享意味着允许对方读写。角色切换不是登录鉴权。正式家庭产品仍需成员邀请、身份权限、链接撤销和数据生命周期设计。

## 模型调用

公开环境关闭 `analyzeMeal` 调用权限，前端默认 `VITE_ENABLE_MEAL_AI=false`，允许直接分享餐食记录。下述流程是保留的接入实现，本次未启用。固定指令在 `cloudfunctions/analyzeMeal/prompt.js`，密钥在服务端环境变量。

浏览器把图片压缩为最长边 900 像素的 JPEG。云函数验证图片和文字，预占当天全局调用次数，再经 HTTPS 请求视觉模型，校验 JSON 结构后返回。

`FOOD_AI_BASE_URL` 默认 DashScope 兼容接口；`FOOD_AI_MODEL` 与 `FOOD_AI_API_KEY` 必须显式设置。原线上具体模型没有可验证的配置，不能用代码默认值反推。模型服务会接收用户主动提交的餐食图片与文字。

每日次数 `DEMO_AI_DAILY_LIMIT` 默认 0；开启后失败请求也占次数，限制重复重试成本。次数上限不是精确金额预算，费用仍受模型单价和输入输出长度影响。

## 已知限制

- 单空间整份状态约 850 KB 上限，图片多时会拒绝云保存；本机保留不代表已上传。长期照片应迁往对象存储。
- 按文档版本识别冲突，没有字段级自动合并；刷新将使用云端版本。
- 公开演示的空间链接不能替代真实家庭隐私权限系统。
- 输出校验只保证结构，不能保证 AI 识别与建议正确。
- 三维脚本部分依赖外部 CDN，网络失败会影响场景。
- 本地构建与策略测试不能替代真实 CloudBase 登录、事务和模型调用验收。

## 接口参考

- [CloudBase Node SDK 登录上下文实现](https://github.com/TencentCloudBase/node-sdk/blob/master/src/auth/index.ts)
- [CloudBase 文档数据库事务](https://docs.cloudbase.net/database/transaction)

接口参考不能代替新环境验收。
