# 部署与验收

当前（2026-10-09）：GitHub Pages 自动构建、测试与发布成功，公开页面 HTTP 200。独立上海环境 `sunny-island-demo-d9dc2x8f51ae43` 已开通，两个集合已设为 ADMINONLY，`islandState` / `analyzeMeal` 已部署为 Nodejs20.19 事件函数。匿名访客登录待开启；模型尚未配置，调用额度保持 0。部署成功不等于跨设备同步和模型调用验收通过。

在线地址：https://yusi21-bot.github.io/sunny-island/

环境体验版到期时间：2027-04-09 23:59:59；自动续费和超额付费均关闭。

## 前端

Node.js 22 LTS 下执行 `npm install`、`npm run build`，将 `dist/` 发布到 GitHub Pages 或静态托管。资源路径为相对路径，支持仓库子路径。

将 `.env.example` 复制为 `.env.local`：

```dotenv
VITE_CLOUDBASE_ENV_ID=新的独立演示环境ID
VITE_CLOUDBASE_REGION=ap-shanghai
```

环境 ID 是连接配置，不是 API 密钥。不要给 `VITE_` 变量填模型密钥。修改后重新构建。留空时只运行本机预览。

## CloudBase

选择独立演示环境及兼容 CloudBase 文档 API 的云数据库（JSON 文档数据库），不要直接用 PostgreSQL 替代。费用与到期政策以控制台订单为准。

1. 开启所需匿名登录，将演示域名和本地调试来源加入安全域名。
2. 创建 `sunny_island_demo_state` 和 `sunny_island_demo_usage` 集合。
3. 集合拒绝客户端直接读写，仅云函数服务端访问；本次设为 `ADMINONLY`（等价于客户端读写条件均为 `false`）。
4. 新建 `islandState` 和 `analyzeMeal` 函数，上传各目录完整内容，包括 `policy.js` 和 `package.json`，安装依赖。
5. 入口均为 `index.main`，选择支持 `fetch` 的 Node.js 运行时（建议 20 或以上，以控制台可用版本为准），餐食函数超时至少 30 秒。
6. 使用 SDK 携带登录上下文调用，不额外开放无需鉴权的 HTTP 入口。

## 模型

仅在餐食云函数环境变量中填写：

| 变量 | 用途 |
| --- | --- |
| `FOOD_AI_API_KEY` | 服务端密钥 |
| `FOOD_AI_BASE_URL` | HTTPS 兼容接口，默认 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `FOOD_AI_MODEL` | 账号可用且支持图片和 JSON 输出的模型 ID，必填 |
| `DEMO_AI_DAILY_LIMIT` | 每日演示总次数，默认 0，首次验收可设 10 |

密钥不要提交 Git、粘贴到聊天或放进截图。测试用虚构文字及不含个人信息的餐食照片。

## 验收表

| 检查 | 通过标准 | 状态 |
| --- | --- | --- |
| 静态站点 | 公开地址、刷新、子路径资源正常 | 自动发布成功、HTTP 200；公网浏览器交互复验待完成 |
| 初始化 | 匿名登录并创建虚构空间 | 待匿名登录与端到端验收 |
| 隔离 | 不同空间无法看到彼此记录 | 待匿名登录与端到端验收 |
| 同岛同步 | 设备 A 修改日程和留言，设备 B 能看到 | 待匿名登录与端到端验收 |
| 并发 | 旧版本写入被拒绝，页面提示 | 待匿名登录与端到端验收 |
| 餐食 AI | 真实图片经模型返回合法结果 | 待模型配置 |
| 用户确认 | AI 结果经点击分享后才进入动态 | 待真实调用 |
| 失败提示 | 未配置、断网、额度耗尽不会显示假结果 | 本地未配置提示已通过；其余待云端 |
| 发布检查 | 无密钥和真实家庭记录 | 发布前检查 |

完成后再更新状态。套餐和外部模型分别计费；建议先限制调用额度，不默认开启无限按量或自动续费。到期前决定续费或下线，有保留需要时自行导出并验证备份。
