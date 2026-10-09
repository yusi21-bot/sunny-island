# 部署说明

2026-10-09 已发布：

- [独立云端演示](https://sunny-island-demo-d9dc2x8f51ae43-1454815199.tcloudbaseapp.com/)：配置匿名登录、演示数据库和同步云函数。首次访问可能出现腾讯云测试域名提示。
- [GitHub Pages 预览](https://yusi21-bot.github.io/sunny-island/)：本机保存。体验版拒绝添加 GitHub Pages 和本地调试安全域名，所以此地址未配置云同步。

云环境 `sunny-island-demo-d9dc2x8f51ae43`，上海。体验版到期时间为 2027-04-09 23:59:59，自动续费和超额付费关闭。模型服务未开通调用。套餐限制以控制台为准。

## 前端

Node.js 22 LTS，执行 `npm ci`、`npm run build`，发布 `dist/`。资源采用相对路径，支持仓库子路径。

不填写环境配置时使用本机存储。云端版本将 `.env.example` 复制为不提交的 `.env.local`：

```dotenv
VITE_CLOUDBASE_ENV_ID=你的独立环境ID
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_ENABLE_MEAL_AI=false
```

环境 ID 不是密钥；所有 `VITE_` 变量都会进入前端，不能存放模型密钥。修改后重新构建。当前免费环境只能使用平台允许的来源，不能靠填写环境 ID 绕过安全域名限制。

## 后端

使用兼容 CloudBase 文档 API 的 JSON 云数据库。现有实现不能直接换成 PostgreSQL。

1. 在独立演示环境开启匿名登录，使用套餐允许的静态托管域名。
2. 创建 `sunny_island_demo_state`、`sunny_island_demo_usage` 两个集合，权限均设为 `ADMINONLY`，客户端不能直接读写。
3. 部署 `cloudfunctions/` 下两个函数的完整目录并安装依赖，入口 `index.main`，运行时 Nodejs20.19。配置见 `cloudbaserc.json`。
4. 设置环境的云函数调用权限：

```json
{
  "*": { "invoke": false },
  "islandState": { "invoke": "auth != null" },
  "analyzeMeal": { "invoke": false }
}
```

这只允许已登录的客户端调用同步函数，包含匿名登录。同步函数还检查随机空间令牌和版本号。空间链接持有人可以读写，适合虚构演示，不是正式家庭隐私授权系统。

官方 CLI 登录后，在本项目目录部署：

```bash
tcb fn deploy --all --install-dependency true
npm run build
tcb hosting deploy ./dist --verify
```

## 餐食 AI

本次按项目作者的选择不开放付费模型调用：前端关闭分析入口、云函数禁止客户端调用、服务端额度为 0，且不配置模型密钥。餐食记录仍可直接分享。

以后自用接入的方法、system prompt 和密钥位置见 [餐食 AI 说明](meal-ai.md)。不要只打开前端按钮就认为已接入模型，也不要把密钥上传到 GitHub。

## 验证与限制

已通过官方 SDK 对真实环境的匿名登录、保存、独立客户端读回、空间分离、旧版本拒绝和权限拒绝测试。发布文件校验通过。浏览器完整双设备操作仍需复验，详见 [验证记录](verification.md)。

[CloudBase 云函数安全规则](https://docs.cloudbase.net/cloud-function/security-rules) · [管理端安全规则 API](https://docs.cloudbase.net/en/api-reference/manager/node/rule)
