# 餐食分析云函数

入口 `index.main`。部署时上传整个目录，包含 `index.js`、`prompt.js`、`policy.js`、`package.json`，并安装依赖。

`prompt.js` 是固定 system prompt，`index.js` 负责读取服务端环境变量并调用多模态模型。密钥仅放在云函数环境变量 `FOOD_AI_API_KEY` 中。

公开演示主动关闭此函数的客户端调用权限，未配置模型密钥，`DEMO_AI_DAILY_LIMIT=0`。保留代码用于说明原理和自用部署，不提供预置答案冒充 AI 输出。

完整解释见 [餐食 AI 接入说明](../../docs/meal-ai.md)，环境配置见 [部署说明](../../docs/deployment.md)。
