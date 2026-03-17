/**
 * 10 个标准动作 — 对应智能助手工作状态
 * 精灵图：1xN 水平条，总 25 帧
 */
const ACTIONS = Object.freeze({
  Idle:         { id: 'idle',         name: '待机',   start: 0,  count: 1,  desc: '空闲等待' },
  Walk:         { id: 'walk',         name: '行走',   start: 1,  count: 4,  desc: '移动中' },
  Search:       { id: 'search',       name: '搜索',   start: 5,  count: 3,  desc: '检索/查找' },
  Process:      { id: 'process',      name: '处理',   start: 8,  count: 3,  desc: '思考/计算' },
  OutputText:   { id: 'outputText',    name: '输出文字', start: 11, count: 3, desc: '生成文本' },
  OutputVisual: { id: 'outputVisual', name: '输出视觉', start: 14, count: 3, desc: '生成图像/视觉' },
  Listen:       { id: 'listen',       name: '聆听',   start: 17, count: 2,  desc: '接收输入' },
  Wait:         { id: 'wait',         name: '等待',   start: 19, count: 2,  desc: '等待响应' },
  Error:        { id: 'error',        name: '错误',   start: 21, count: 2,  desc: '出错状态' },
  Success:      { id: 'success',      name: '成功',   start: 23, count: 2,  desc: '完成/成功' },
});

const TOTAL_FRAMES = 25;
const FRAME_ORDER = [
  'Idle', 'Walk', 'Search', 'Process', 'OutputText', 'OutputVisual', 'Listen', 'Wait', 'Error', 'Success'
];

function getActionByFrame(frameIndex) {
  for (const key of FRAME_ORDER) {
    const a = ACTIONS[key];
    if (frameIndex >= a.start && frameIndex < a.start + a.count) return a;
  }
  return null;
}

function getFrameRange(actionId) {
  const a = Object.values(ACTIONS).find(x => x.id === actionId);
  return a ? { start: a.start, count: a.count } : null;
}
