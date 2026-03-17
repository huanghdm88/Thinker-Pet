# Thinker-pet 项目本地 Code Review

> 审查范围：Thinker-pet 核心页 + Thinker-Pet-app-demo 应用，基于当前代码库。

---

## 一、项目概览

- **Thinker-pet**：单页 HTML，展示 21 个 AI 角色（像素风）、11 种动作、进化形态、中英切换；支持 URL 参数、`window.ThinkerPet` API、postMessage 嵌入。
- **Thinker-Pet-app-demo**：H5 对话 demo，用 iframe 嵌入 Thinker-pet，模拟 Agent（Cron/长记忆/技能），并按 INTEGRATION 规则驱动角色动作与进化。

---

## 二、优点

1. **文档清晰**：`INTEGRATION.md` 写得很完整，动作与 Openclaw 场景对应、进化/退化规则、URL/API/postMessage 用法都有说明，便于接入。
2. **接入方式统一**：URL、同页 API、postMessage 三种方式一致，`applyState` 一次设置多状态，设计合理。
3. **嵌入模式**：`embed=1` 时隐藏标题/按钮等，只保留画布，适合 iframe 集成。
4. **多语言**：中英切换覆盖标题、副标题、动作名、对话气泡、进化按钮等，体验完整。
5. **角色与动作数据**：`ACTIONS`、`CHARACTERS`、各 base 的帧数据集中管理，进化叠加层单独维护，结构清楚。
6. **Demo 职责分明**：storage / characters / bridge / agent / chat 分文件，进化逻辑在 agent 里集中处理，便于维护。

---

## 三、问题与建议

### 1. 代码重复与数据不一致

- **Thinker-pet/index.html** 内联了 `actions.js` 和 `characters.js` 的完整逻辑（含 ACTIONS、CHARACTERS、ROBOT_FRAMES 等），而仓库里仍有独立的 `actions.js`、`characters.js`。
  - **问题**：独立文件里没有 `Dialogue` 动作、没有皮卡丘、角色只有 20 个且无 `nameEn`/`evolvedAccent`；与 index 内联版本不一致，易导致后续只改一处而出现行为/展示分叉。
  - **建议**：以 index 内联版本为唯一数据源，要么删除独立文件并在注释中说明“仅作参考/已合并到 index”，要么改为由构建步骤从同一份数据生成 index 内联 + 独立文件，避免双份维护。

- **Thinker-Pet-app-demo/js/characters.js** 与 Thinker-pet 的 CHARACTERS 列表（名称、顺序）应对齐。
  - 当前 demo 的 `CHARACTERS` 已有 21 个且含皮卡丘，与 INTEGRATION 一致，这点没问题；若 Thinker-pet 再增角色，记得同步更新 demo 的 `characters.js` 或通过 bridge 从 Thinker-pet 取列表。

### 2. 潜在 Bug

- **进化时连续点击**：在 `index.html` 中，进化按钮的 handler 里用 `if (isTransitioning) return;` 防止重复点击，但若用户快速连续点击，仍可能在前一次 `setInterval` 未结束时再次进入，导致 `transitionFlashStep`、`transitionIntervalId` 状态错乱。
  - **建议**：在 `setInterval` 回调里第一次执行时就 `transitionIntervalId = null`（或禁用按钮），并确保只有一处 `clearInterval(transitionIntervalId)`，避免重复 clear。

- **postMessage 无 origin 校验**：`window.addEventListener('message', ...)` 中未判断 `e.origin`，任何域都可向页面发送 `type: 'thinker-pet'` 的消息并驱动角色。
  - **建议**：若嵌入方域名固定，可白名单校验，例如：  
    `if (e.origin !== 'https://your-app.com') return;`  
    若需支持任意域嵌入，至少在文档中说明“仅用于可信任父页面”，避免被恶意页面滥用。

- **storage.js 的 setSessionStartAt(null)**：`checkDevolveOnLoad` 里调用 `setSessionStartAt(null)`，而 `setSessionStartAt` 实现是 `set(..., (date || new Date()).toISOString())`，传 `null` 会变成存当前时间，与“重置 session”语义不符。
  - **建议**：在 storage 中为 session 支持“清除”，例如 `setSessionStartAt(null)` 时写 `localStorage.removeItem(KEY)` 或单独存一个空标记；或在 agent 里用单独的 key 表示“未开始 session”。

### 3. 健壮性

- **getCharacterIndex() 与 CHARACTERS 长度**：demo 的 `getCharacterIndex()` 限制为 `0 <= index <= 20`，若 Thinker-pet 将来增加角色（例如 22 个），demo 会仍只认 0～20，需要同步改 storage 的校验和 characters 列表。

- **iframe 未加载完成就发 postMessage**：demo 的 chat 里已在 iframe 的 `load` 事件里调 `bridge.setCharacter/setAction/setEvolved`，这是对的。INTEGRATION 里也写了“需在 iframe load 后再发送消息”，建议在 bridge 或文档中再强调一次，避免接入方遗漏。

- **marked 依赖**：index 用 CDN 的 `marked` 解析 INTEGRATION.md。若 CDN 失败或被墙，文档弹窗会一直“加载中…”或报错，没有降级提示。
  - **建议**：`fetch('INTEGRATION.md').catch(...)` 里给用户明确提示（如“文档加载失败，请检查网络”），并可选提供文档的备用链接。

### 4. 可维护性

- **index.html 体积**：单文件约 760+ 行，内含大量帧数组（ROBOT_FRAMES、DUCK_*、PIKACHU_* 等）和渲染逻辑，阅读和 diff 成本高。
  - **建议**：将“数据”（ACTIONS、CHARACTERS、各 BASE_FRAMES、EVOLVED_OVERLAY_GRIDS）与“渲染 + 交互”拆成独立 JS 文件，用 script 引入；或用简单构建步骤把数据与主逻辑合并成一个 bundle，便于后续加角色/动作。

- **魔法数字**：如 `currentActionIndex = 10`（默认对话）、`CHAR_W * 0.5`（行走位移）、`4000 + Math.random() * 2000`（对话持续时间）等，建议抽成命名常量或配置，方便调参和统一修改。

- **agent.js 的 getLongMemory**：`runSkill` 里用 `typeof getLongMemory === 'function'` 判断，依赖全局函数；若 script 加载顺序变化可能拿不到。demo 里 storage 先于 agent 加载，当前没问题，建议在 README 或注释中写明依赖顺序。

### 5. 安全与隐私

- **localStorage**：demo 的角色、人设、长记忆、Cron、聊天记录、进化状态等均存本地，未加密。若设备多人共用或将来做敏感信息，需要考虑加密或服务端存储。
- **XSS**：chat 里用 `escapeHtml(content)` 再 `replace(/\n/g, '<br>')` 展示消息，已做转义，没问题。设置页若存在“人设/长记忆”等用户输入渲染到 HTML，需同样做转义或使用 textContent。

### 6. 小优化

- **INTEGRATION.md 角色表**：文档里角色表列到索引 20（皮卡丘），与代码一致；若以后增删角色，记得同步更新文档表格。
- **vercel.json**：当前仅 `"framework": null`，若部署到 Vercel 且为纯静态，可考虑加 `rewrites` 把单页路由指到 `index.html`（若将来做多路由再改）。
- **.gitignore**：只包含 `.vercel`，一般足够；若本地会生成构建产物或密钥文件，可一并忽略。

---

## 四、总结表

| 类别         | 状态 | 说明 |
|--------------|------|------|
| 功能完整性   | ✅   | 角色/动作/进化/语言/嵌入/API 均可用 |
| 文档         | ✅   | INTEGRATION 与 README 清晰 |
| 数据一致性   | ⚠️   | 独立 actions/characters 与 index 内联不一致，需统一 |
| 安全         | ⚠️   | postMessage 未校验 origin；localStorage 明文 |
| 健壮性       | ⚠️   | 进化连续点击、session 重置 null 语义需修 |
| 可维护性     | ⚠️   | index 单文件过大，建议拆数据与逻辑 |

整体来说，Thinker-pet 和 demo 的功能与文档都做得不错，适合作为 Openclaw 等智能体前端的展示与接入参考。优先建议：**统一角色/动作数据源**、**修掉 session 重置与进化防抖**、**postMessage 增加 origin 校验（或文档明确使用场景）**，再视需要做 index 拆分与常量提取以利长期维护。
