// js/core/world.js
// 全局世界状态 + 常量

// 玩家在屏幕上的固定 x 位置(卷轴游戏中玩家视觉位置不变)
// 不再硬编码 — 由 initWorldSize() 根据画布实际尺寸动态计算
export let PLAYER_X = 240;
export let PLAYER_Y = 268;
export let CANVAS_W = 800;
export let CANVAS_H = 320;
export const SCROLL_SPEED = 60;  // 卷轴滚动速度 px/s(无怪时慢速推进)

/** 根据画布实际像素尺寸更新所有坐标常量 */
export function updateWorldSize() {
  const w = world.canvas?.width || 800;
  const h = world.canvas?.height || 320;
  CANVAS_W = w;
  CANVAS_H = h;
  PLAYER_X = Math.floor(w * 0.30);
  PLAYER_Y = Math.floor(h * 0.84);
  // 地面线：位于玩家脚下方约 5% 画布高度处（原比例 280/320 ≈ 0.875）
  GROUND_Y = Math.floor(h * 0.89);
}

// 世界对象(不参与存档,运行时重建)
// state 从 state.js 直接引入,不在此代理
export const world = {
  enemies: [],
  projectiles: [],
  particles: [],      // 短命视觉粒子
  damageTexts: [],    // 飘字
  drops: [],          // 装备落地
  gore: [],           // 血渣(短命)
  spawnTimer: 0,
  spawnInterval: 1500,
  // 卷轴
  scrollSpeed: SCROLL_SPEED,
  scrollDistance: 0,   // 累计滚动距离(给 HUD 用)
  // 玩家
  playerShootTimer: 0,
  playerMeleeTimer: 0,
  // Canvas
  canvas: null,
  ctx: null,
  // 波次
  waveState: 'calm',       // 'calm' | 'combat'
  waveTimer: 0,
  waveEnemiesLeft: 0,
  // 计时器
  lastTime: 0,
};

// 血渣落地的"地面" y — 由 updateWorldSize() 动态计算
export let GROUND_Y = 280;
