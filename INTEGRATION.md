# Thinker-pet 调用规则

Thinker-pet 用于在页面中展示 AI 角色及其状态，可与 **Openclaw** 等智能体平台配合：由调用方根据 Openclaw 的当前能力/状态驱动角色动作与进化形态。其他项目可通过 **URL 参数**、**同页脚本 API** 或 **iframe + postMessage** 控制角色选择、进化状态、动作与**界面语言（中/英）**。

---

## 一、Openclaw 能力与角色动作对应

调用方应根据 Openclaw 智能体的当前状态或能力，将 **Thinker-pet 动作** 与之对应，并通过 `setAction(actionId)` 或 URL/postMessage 更新展示。

| Thinker-pet 动作 id | 中文名 | 英文名 | 建议对应的 Openclaw 场景 |
|--------------------|--------|--------|---------------------------|
| `idle` | 待机 | Idle | 智能体空闲、无任务、未在对话 |
| `walk` | 行走 | Walk | 智能体在移动/切换上下文、准备执行 |
| `search` | 搜索 | Search | 检索、查找、浏览（如调用检索/搜索类工具） |
| `process` | 处理 | Process | 推理、计算、思考（多步推理或任务分解中） |
| `outputText` | 输出文字 | Output Text | 生成并返回文本结果 |
| `outputVisual` | 输出视觉 | Output Visual | 生成图像、图表或视觉类输出 |
| `listen` | 聆听 | Listen | 接收用户输入、等待指令 |
| `wait` | 等待 | Wait | 等待外部响应、轮询或挂起 |
| `error` | 错误 | Error | 执行失败、异常、工具报错 |
| `success` | 成功 | Success | 任务完成、执行成功 |
| `dialogue` | 对话 | Dialogue | 与用户对话中、多轮对话进行中 |

**说明**：上表为建议映射，调用方可根据业务将 Openclaw 的「工具调用」「技能执行」「对话中」等状态自行映射到上述 `actionId`，并调用 `setAction(id)` 更新角色表现。

---

## 二、进化与退化规则（由调用方实现）

Thinker-pet 仅负责**展示**是否进化（`evolved`），**何时进化/退化由调用方根据使用时长与活跃度自行判断并调用 API**。

| 规则 | 条件 | 调用方应执行 |
|------|------|--------------|
| **进化** | 用户**连续对话**或**连续执行任务**累计超过 **15 分钟** | 调用 `setEvolved(true)`（或 URL/postMessage 设置 `evolved=1`），使角色进入进化形态。 |
| **退化** | **超过 24 小时**既无对话也无任务执行 | 调用 `setEvolved(false)`（或 `evolved=0`），使角色恢复为初始形态。 |

**实现要点**（在接入 Openclaw 的宿主应用中）：

- 统计「连续对话/任务」时长：从最近一次对话或任务开始计时，若持续 ≥ 15 分钟则触发进化；若中途超过一定时间无新消息/无新任务，可重置计时（是否重置、阈值由业务决定）。
- 统计「最后活跃时间」：记录最后一次对话或任务完成时间；若当前时间与最后活跃时间间隔 > 24 小时，则触发退化。
- 进化/退化时调用 Thinker-pet 的 `setEvolved(true)` 或 `setEvolved(false)` 即可，页面会播放进化/恢复动效。

---

## 三、语言切换（中 / 英）

- **取值**：`zh`（中文）、`en`（英文）。
- **影响**：页面标题、副标题、角色名称、动作按钮文案、进化按钮、角色 base 标签、以及**对话气泡内的文案**均会随语言切换。
- **URL**：`?lang=en` 或 `?language=en` 表示首次加载为英文。
- **API**：`window.ThinkerPet.setLanguage('en')` / `setLanguage('zh')`。
- **postMessage**：`{ type: 'thinker-pet', method: 'setLanguage', language: 'en' }`。

---

## 四、角色选择

### 4.1 角色列表（按索引）

| 索引 | id    | name       | base    |
|------|--------|------------|---------|
| 0    | c01    | 科技人形   | robot   |
| 1    | c02    | 暖阳鸭     | duck    |
| 2    | c03    | 薄荷兔     | rabbit  |
| 3    | c04    | 樱花喵咪   | cat     |
| 4    | c05    | 天空熊     | bear    |
| 5    | c06    | 暖橙人形   | robot   |
| 6    | c07    | 青柠鸭     | duck    |
| 7    | c08    | 薰衣草喵咪 | cat     |
| 8    | c09    | 蜜桃兔     | rabbit  |
| 9    | c10    | 深海熊     | bear    |
| 10   | c11    | 琥珀人形   | robot   |
| 11   | c12    | 翡翠鸭     | duck    |
| 12   | c13    | 玫瑰喵咪   | cat     |
| 13   | c14    | 奶油兔     | rabbit  |
| 14   | c15    | 靛青熊     | bear    |
| 15   | c16    | 珊瑚红人形 | robot   |
| 16   | c17    | 柠檬鸭     | duck    |
| 17   | c18    | 丁香喵咪   | cat     |
| 18   | c19    | 森林兔     | rabbit  |
| 19   | c20    | 雾灰熊     | bear    |
| 20   | c21    | 皮卡丘     | pikachu |

- **索引**：从 `0` 到 `20`，共 21 个角色。
- **id**：角色唯一标识，如 `c01`、`c21`。
- **base**：基础形态类型，决定进化时的外观增幅（robot / duck / cat / bear / rabbit / pikachu）。

### 4.2 调用方式

- **按索引**：`character=0`～`20`（推荐）。
- **按 id**：当前仅支持 URL 中的 `character` 为数字索引；若需按 id 选择，调用方需自行维护「id → 索引」映射，或使用下方脚本 API 的 `getCharacters()` 查询后传索引。

---

## 五、角色进化

- **含义**：是否显示「进化形态」（在原有形态上叠加细节与配色变化）。
- **取值**：`0` / `1`，或布尔值。
- **行为**：进化/恢复时会播放约 3 次闪烁再切换，进化后保留所有动作与道具。

### 调用示例

- URL：`?evolved=1` 为进化，`?evolved=0` 为原貌。
- API：`setEvolved(true)` / `setEvolved(false)`。

---

## 六、动作列表（按索引与 id）

| 索引 | id          | name     |
|------|-------------|----------|
| 0    | idle        | 待机     |
| 1    | walk        | 行走     |
| 2    | search      | 搜索     |
| 3    | process     | 处理     |
| 4    | outputText  | 输出文字 |
| 5    | outputVisual| 输出视觉 |
| 6    | listen      | 聆听     |
| 7    | wait        | 等待     |
| 8    | error       | 错误     |
| 9    | success     | 成功     |
| 10   | dialogue    | 对话     |

- **索引**：`0`～`10`。
- **id**：动作唯一标识，用于 API 的 `setAction(id)`。

---

## 七、URL 参数（页面直链 / iframe src）

在 Thinker-pet 页面地址后追加查询参数，用于**首次加载**时的初始状态：

| 参数       | 说明           | 示例 |
|------------|----------------|------|
| `character`| 角色索引 0～20 | `?character=20` |
| `action`   | 动作索引 0～10 或动作 id | `?action=dialogue` 或 `?action=10` |
| `evolved`  | 是否进化：0/1 或 true/false | `?evolved=1` |
| `lang` / `language` | 界面语言：`zh` / `en` | `?lang=en` |

### 组合示例

- 皮卡丘 + 对话 + 进化：  
  `https://your-domain/Thinker-pet/?character=20&action=dialogue&evolved=1`
- 第 1 个角色 + 待机 + 原貌：  
  `https://your-domain/Thinker-pet/?character=0&action=idle&evolved=0`
- 英文界面：  
  `https://your-domain/Thinker-pet/?lang=en`

---

## 八、同页脚本 API（window.ThinkerPet）

页面加载并执行完初始化后，全局对象 `window.ThinkerPet` 可用。

### 8.1 方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `setCharacter(index)` | `index`: 0～20 | 切换角色 |
| `setAction(actionIndexOrId)` | 数字索引 0～10 或动作 id 字符串（如 `'dialogue'`） | 切换动作 |
| `setEvolved(evolved)` | `true` / `false` | 设置进化/原貌 |
| `setLanguage(lang)` | `'zh'` / `'en'` | 切换界面与对话语言（含气泡文案） |
| `applyState(characterIndex, action, evolved)` | 三者皆可省略（传 `null`/`undefined` 表示不改） | 一次性设置角色、动作、进化 |
| `getState()` | — | 返回当前 `{ characterIndex, character, actionIndex, actionId, evolved, language }` |
| `getCharacters()` | — | 返回角色数组副本 |
| `getActions()` | — | 返回动作列表 `{ id, name, index }[]`（name 随当前语言） |

### 8.2 使用示例（同页或同域 iframe 内）

```javascript
// 等待页面就绪
if (window.ThinkerPet) {
  window.ThinkerPet.setCharacter(20);        // 皮卡丘
  window.ThinkerPet.setAction('dialogue');   // 对话
  window.ThinkerPet.setEvolved(true);        // 进化
  window.ThinkerPet.setLanguage('en');       // 切换为英文（含对话气泡）
}

// 或一次性设置
window.ThinkerPet.applyState(20, 'dialogue', true);

// 查询当前状态
var state = window.ThinkerPet.getState();
// state.characterIndex, state.actionId, state.evolved, state.language 等

// 枚举角色/动作（供外部选择器用）
var characters = window.ThinkerPet.getCharacters();
var actions = window.ThinkerPet.getActions();
```

---

## 九、iframe + postMessage（跨域调用）

父页面通过 iframe 嵌入 Thinker-pet 后，向 iframe 的 `contentWindow` 发送 `postMessage`，消息体需包含 `type: 'thinker-pet'` 与下列 `method`。

### 9.1 消息格式

```json
{
  "type": "thinker-pet",
  "method": "setCharacter" | "setAction" | "setEvolved" | "setLanguage" | "applyState",
  "characterIndex": 0,
  "action": "dialogue",
  "evolved": true,
  "language": "en"
}
```

- `type`：固定为 `'thinker-pet'`。
- `method`：要调用的操作；未用到的字段可省略。

### 9.2 各 method 的推荐参数

| method         | 推荐参数 | 说明 |
|----------------|----------|------|
| setCharacter   | `characterIndex`: 0～20 | 切换角色 |
| setAction      | `action`: 动作 id 或索引 0～10 | 切换动作 |
| setEvolved     | `evolved`: true/false | 进化/原貌 |
| setLanguage    | `language`: `'zh'` / `'en'` | 切换界面与对话语言 |
| applyState     | `characterIndex`, `action`, `evolved`（均可选） | 一次性设置 |

### 9.3 父页面示例

```html
<iframe id="thinkerPet" src="https://your-domain/Thinker-pet/"></iframe>
<script>
  var iframe = document.getElementById('thinkerPet');
  function send(cmd) {
    iframe.contentWindow.postMessage({ type: 'thinker-pet', ...cmd }, '*');
  }
  // 选择皮卡丘、对话、进化
  send({ method: 'applyState', characterIndex: 20, action: 'dialogue', evolved: true });
  // 切换为英文（含对话气泡）
  send({ method: 'setLanguage', language: 'en' });
  // 仅切换动作
  send({ method: 'setAction', action: 'success' });
</script>
```

注意：若 iframe 未加载完成，需在 iframe 的 `load` 事件后再发送消息。

---

## 十、小结

| 能力       | URL 参数 | window.ThinkerPet | postMessage |
|------------|----------|-------------------|-------------|
| 角色选择   | `character=0`～`20` | `setCharacter(index)` | `method: 'setCharacter', characterIndex` |
| 进化开关   | `evolved=0|1` | `setEvolved(bool)` | `method: 'setEvolved', evolved` |
| 动作选择   | `action=id或索引` | `setAction(id或索引)` | `method: 'setAction', action` |
| 语言切换   | `lang=zh|en` | `setLanguage('zh'\|'en')` | `method: 'setLanguage', language` |
| 一次设置   | 同 URL 多参数 | `applyState(c,i,e)` | `method: 'applyState', characterIndex, action, evolved` |
| 仅首次加载 | ✓         | 随时               | iframe 加载后随时 |

**进化/退化逻辑**：Thinker-pet 只负责展示 `evolved` 状态；**连续对话或任务 ≥ 15 分钟触发进化**、**超过 24 小时无对话无任务触发退化** 的规则需由调用方（如接入 Openclaw 的宿主应用）根据时长与活跃度判断后调用 `setEvolved(true/false)`。动作与 Openclaw 的对应关系见 **§ 一**。

其他项目可按需选用：**仅打开链接**用 URL；**同域嵌入或同页**用 `window.ThinkerPet`；**跨域 iframe** 用 postMessage。
