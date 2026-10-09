# 餐食 AI：prompt、模型和密钥分别放哪里

## 这个功能想做什么

妈妈比较关心饮食。我想让她拍一张餐食照片、补充菜名或份量，就能看到食物识别、搭配观察和一条容易执行的建议。结果先展示给她，再由她选择是否分享给家人。

识图能力来自支持图片输入的多模态模型。Prompt 负责规定任务和回答方式；它不能让一个只支持文字的模型突然看懂照片。同一家模型服务可能同时提供文字模型和视觉模型，开通账号或拿到 API Key 不代表每个模型都支持图片，具体以所选模型的接口说明为准。

## 三层分别负责什么

| 层 | 负责的事 | 放什么 |
| --- | --- | --- |
| 网页前端 | 选择和压缩照片、收集补充说明、展示结果 | 图片、用户文字、公开的 CloudBase 环境 ID |
| 后台云函数 `analyzeMeal` | 检查登录和输入、限制次数、组装请求、调用模型、校验结果 | 固定 system prompt；从环境变量读取 API Key 和模型配置 |
| 模型服务 | 理解照片和文字，按要求返回内容 | 接收后台请求，按服务规则扣额度 |

API Key 相当于模型服务的调用凭证。购买或开通额度后，它应填在**腾讯云 `analyzeMeal` 云函数的环境变量**里，不是放进网页、GitHub 仓库或 `VITE_` 开头的前端变量。CloudBase 环境 ID 只是用来定位后端，不是模型密钥。

一次请求的过程：网页上传照片和说明 → 云函数读取服务端密钥、加上固定 prompt → 请求视觉模型 → 校验返回 JSON → 网页显示结果 → 本人决定是否分享。

## system prompt 放在哪里

固定指令单独放在 [`cloudfunctions/analyzeMeal/prompt.js`](../cloudfunctions/analyzeMeal/prompt.js)，由 [`index.js`](../cloudfunctions/analyzeMeal/index.js) 引入，作为 `messages` 中 `role: "system"` 的内容发送。照片和用户说明作为 `role: "user"` 发送，和固定指令分开。

这份 prompt 主要约定：

1. 先识别能看清的食物，拿不准就说明，不编造菜名和份量。
2. 从主食、蔬菜、蛋白质等类别观察搭配，指出值得保留的地方。
3. 给一条下一餐能执行的建议，避免写成长篇说教。
4. 不根据照片推断精确热量、油盐、疾病或全天摄入；不默认家庭成员的身体情况。
5. 返回固定 JSON，方便网页分别展示食物、搭配观察、建议和可分享的一句话。

如果以后妈妈提出更具体的关注点，可以再调整固定指令。现在没有她的疾病、过敏或营养目标信息，因此不预设这些条件。固定 prompt 可以公开；需要保护的是密钥和真实家庭资料。

示意请求（实际代码在云函数里）：

```js
messages: [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: [
    { type: 'text', text: '米饭、青菜和鸡蛋，这是午餐' },
    { type: 'image_url', image_url: { url: imageDataUrl } }
  ] }
]
```

## 公开版为什么不接我的额度

公开一个网页或 GitHub 仓库，不会自动扣模型费用。调用模型时才涉及模型服务费用，具体按服务商的计费规则执行。 但如果开放了后端模型调用接口，别人即使看不到密钥，也可能反复请求这个接口，消耗我的额度。

因此这次公开版：

- 云函数权限规则中关闭 `analyzeMeal`，公开访客不能调用；
- 不配置 `FOOD_AI_API_KEY` 和 `FOOD_AI_MODEL`；
- `DEMO_AI_DAILY_LIMIT=0`，服务端关闭调用；
- 前端 `VITE_ENABLE_MEAL_AI=false`，说明 AI 未开放，仍能直接记录和分享餐食；
- 不用预置结果冒充模型输出。

只隐藏按钮、只加一段 system prompt，都不能代替服务端额度控制。当前代码虽然有登录检查、输入大小限制、每日总次数和超时限制，但这些不等于完整的防滥用系统。以后若要长期向公众开放，还需要按用户限频、成本告警、服务商预算限制等措施；匿名登录本身也不能可靠限制一个人的请求次数。

## 以后自己家里要恢复调用时

无需改前端去保存密钥。在腾讯云控制台找到 `analyzeMeal`，设置以下**服务端环境变量**：

| 变量 | 填什么 |
| --- | --- |
| `FOOD_AI_API_KEY` | 模型服务商提供的有效密钥 |
| `FOOD_AI_MODEL` | 支持图片输入、且账号可以调用的模型 ID |
| `FOOD_AI_BASE_URL` | 服务商的 OpenAI 兼容接口地址；当前默认 DashScope 兼容地址 |
| `DEMO_AI_DAILY_LIMIT` | 允许的每日总次数；保持 0 就不会调用 |

还需要在自用环境的云函数权限中允许经过成员认证的用户调用 `analyzeMeal`；当前公开环境的规则是关闭的。不要为了自用配置而直接放开公开访客。

然后在自用部署的前端构建环境中设置 `VITE_ENABLE_MEAL_AI=true`，重新构建和发布。这个开关只是决定界面是否展示分析入口，不是安全措施。修改 `prompt.js` 后也要重新部署云函数。

使用 DashScope 时，当前代码默认地址是 `https://dashscope.aliyuncs.com/compatible-mode/v1`。若账号区域或服务商不同，需使用该账号对应的接口地址，并确认模型支持图片和当前 JSON 输出方式。

**本次只保留和说明这条接入路径，不为公开演示启用付费模型。**

## 接口资料

- [阿里云：API Key 与区域对应关系](https://www.alibabacloud.com/help/en/model-studio/get-api-key)
- [阿里云：视觉模型的 OpenAI 兼容接口](https://www.alibabacloud.com/help/en/model-studio/qwen-vl-compatible-with-openai)
