# 餐食分析云函数

入口 `index.main`。完整部署方法见 [部署指南](../../docs/deployment.md)。上传 `index.js`、`policy.js` 与 `package.json` 后安装依赖。

需要 CloudBase 登录上下文、`sunny_island_demo_usage` 集合，以及服务端 `FOOD_AI_API_KEY` 和 `FOOD_AI_MODEL`。`FOOD_AI_BASE_URL` 默认 DashScope 兼容地址；`DEMO_AI_DAILY_LIMIT` 默认 0，配置正整数后才开放。

函数实际调用视觉模型，验证输入和输出，设置超时并限制每日次数。不会用预置答案代替调用；照片观察不是精确营养测量。密钥仅放服务端。
