// js/core/renderer.js
// Canvas 2D 渲染器 — 从 main.js 提取 (v6.2 架构拆分)
// 统一管理所有绘制调用, main.js 只调用 render(now)
// v7.1: 装备外观系统 + 武器特有攻击效果
// v0.8.1: shakeOff 改为静态复用对象，消灭 getShakeOffset() 每帧 new {x,y} 的 GC 压力

import { world, PLAYER_X, PLAYER_Y, GROUND_Y, SCROLL_SPEED } from './world.js';
import { getShakeOffset } from '../systems/combat.js';
import { state } from './state.js';
import { getWeaponType, DEFAULT_WEAPON } from '../data/weaponTypes.js';
import {
  BOSS_BAR_WIDTH, ELITE_BAR_WIDTH, NORMAL_BAR_WIDTH,
} from '../data/constants.js';

// ============================================================
// CSS 变量颜色缓存 — Canvas 读取 CSS 变量，主题统一管理
// ============================================================
const _colorCache = {};

function readCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getColor(name) {
  if (!_colorCache[name]) {
    _colorCache[name] = readCssVar(name) || '';
  }
  return _colorCache[name];
}

/** 将 hex 颜色转为 rgba 字符串 — 预解析 RGB 分量到缓存，消除每帧 420 次 parseInt */
const _hexRgbCache = {};

function hexToRgbaCached(hex, alpha) {
  let rgb = _hexRgbCache[hex];
  if (!rgb) {
    const h = hex.replace('#', '');
    rgb = {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
    _hexRgbCache[hex] = rgb;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** 获取带透明度的 CSS 变量颜色 */
function getColorAlpha(name, alpha) {
  const hex = getColor(name);
  if (hex.startsWith('#')) return hexToRgbaCached(hex, alpha);
  return hex;
}

// ============================================================
// CRT 战斗颜色系统 — 所有 Canvas 颜色跟随 --crt-text 主题
// paper → 黑墨(#000)  amber → 橙光(#ffb000)  mono → 白光(#fff)
// 用 alpha 控制明暗层次，模拟单色 CRT 磷光的不同亮度
// ============================================================
const _crtColorCache = { hex: '', valid: false };

/** 刷新 CRT 战斗颜色缓存（主题切换时调用 refreshColorCache 会连带清空） */
function ensureCrtColor() {
  if (!_crtColorCache.valid) {
    const hex = readCssVar('--crt-text');
    _crtColorCache.hex = hex || '#ffffff';
    _crtColorCache.valid = true;
  }
}

/** 获取 CRT 主题色 rgba（Canvas 绘制的统一颜色） */
function crt(alpha = 1) {
  ensureCrtColor();
  return hexToRgbaCached(_crtColorCache.hex, alpha);
}

/** 获取 CRT 屏幕底色 rgba — 预热缓存避免 getComputedStyle 每帧调用 */
function crtBg(alpha = 1) {
  if (!_crtColorCache.bgHex) {
    _crtColorCache.bgHex = readCssVar('--crt-screen-bg') || '#000000';
  }
  return hexToRgbaCached(_crtColorCache.bgHex, alpha);
}

/** 清除颜色缓存（主题切换时调用） */
export function refreshColorCache() {
  for (const key of Object.keys(_colorCache)) {
    delete _colorCache[key];
  }
  for (const key of Object.keys(_hexRgbCache)) {
    delete _hexRgbCache[key];
  }
  _crtColorCache.valid = false;
  _crtColorCache.bgHex = null;
}

// ============================================================
// 修复7：静态复用向量对象 — 消除 60fps 下每帧 new {} 的 GC 压力
// ============================================================
// 每帧复用同一个对象，写入坐标后直接读取，不产生短命临时对象
const _shakeVec = { x: 0, y: 0 };

// ============================================================
// 背景动画
// ============================================================
const bgChars = [];

/** 初始化背景字符（canvas 就绪后调用） */
export function initBg() {
  const W = world.canvas?.width || 800;
  const H = world.canvas?.height || 320;
  bgChars.length = 0;
  for (let i = 0; i < 20; i++) {
    bgChars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      symbol: ['\u00B7', '\u00B0', '\u02D9'][Math.floor(Math.random() * 3)],
      speed: 15 + Math.random() * 20,
      alpha: 0.04 + Math.random() * 0.04,
    });
  }
}

let _lastBgTime = 0;

function drawBackground(ctx, now) {
  const dt = (_lastBgTime === 0) ? 1 / 60 : Math.min((now - _lastBgTime) / 1000, 0.1);
  _lastBgTime = now;
  ctx.font = '12px monospace';
  for (const c of bgChars) {
    c.x -= (SCROLL_SPEED + c.speed) * dt;
    if (c.x < -5) { c.x = (world.canvas?.width || 800) + 5; c.y = Math.random() * (world.canvas?.height || 320); }
    ctx.fillStyle = crt(c.alpha);
    ctx.fillText(c.symbol, c.x, c.y);
  }
}

// ============================================================
// 玩家绘制 + 装备外观 (v7.1)
// ============================================================

/**
 * 获取当前装备的武器类型配置
 */
function getEquippedWeaponConfig() {
  const weapon = state.equipment && state.equipment.weapon;
  const attackType = (weapon && weapon.attackType) || 'thought';
  return getWeaponType(attackType);
}

/**
 * 绘制玩家角色 — 武器换肤 + 装备装饰
 */
function drawPlayer(ctx, now) {
  const eq = state.equipment;
  const wp = getEquippedWeaponConfig();
  const px = PLAYER_X;
  const py = PLAYER_Y;

  // ── 1. 躯体光晕（装备总稀有度决定亮度，CRT 主题色发光）──
  let maxRarity = 0;
  for (const slot of Object.keys(eq)) {
    const item = Array.isArray(eq[slot]) ? eq[slot].find(i => i !== null) : eq[slot];
    if (!item) continue;
    const rv = { common: 0, magic: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 }[item.rarity] || 0;
    if (rv > maxRarity) maxRarity = rv;
  }
  if (maxRarity >= 3) {
    const pulse = 0.5 + 0.5 * Math.sin(now / 800 + maxRarity);
    ctx.shadowColor = crt(1);
    ctx.shadowBlur = 6 + maxRarity * 4 + pulse * 10;
  }

  // ── 2. 胸部装备（CRT 主题色 · 中亮）──
  if (eq.chest) {
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = crt(0.6);
    ctx.shadowColor = crt(0.8);
    ctx.shadowBlur = 2;
    ctx.fillText('[', px - 22, py + 4);
    ctx.fillText(']', px + 8, py + 4);
  }

  // ── 3. 头部 — 冠冕（CRT 主题色 · 高亮）──
  if (eq.head) {
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = crt(0.8);
    ctx.shadowColor = crt(1);
    ctx.shadowBlur = 3;
    ctx.fillText('\u265B', px - 12, py - 18);
  }

  // ── 4. 靴子（CRT 主题色 · 中亮）──
  if (eq.boots) {
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = crt(0.5);
    ctx.shadowColor = crt(0.6);
    ctx.shadowBlur = 2;
    ctx.fillText('__', px - 10, py + 18);
  }

  // ── 5. 戒指 — 旋转星点（CRT 主题色 · 中亮 + 脉冲）──
  if (eq.ring && (eq.ring[0] || eq.ring[1])) {
    const ringAngle = now / 600;
    const rx = px + Math.cos(ringAngle) * 24;
    const ry = py + Math.sin(ringAngle) * 14 + 4;
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = crt(0.7);
    ctx.shadowColor = crt(0.9);
    ctx.shadowBlur = 4;
    ctx.fillText('\u25C6', rx - 5, ry);
  }

  // ── 6. 护符 — 旋转星点（CRT 主题色 · 高亮 + 大光晕）──
  if (eq.amulet) {
    const amAngle = now / 800 + Math.PI / 2;
    const ax = px + Math.cos(amAngle) * 20;
    const ay = py + Math.sin(amAngle) * 20 - 6;
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = crt(0.85);
    ctx.shadowColor = crt(1);
    ctx.shadowBlur = 6;
    ctx.fillText('\u2726', ax - 6, ay);
  }

  // ── 7. 护身符 — 旋转星点（CRT 主题色 · 中亮）──
  if (eq.charm) {
    const chAngle = now / 1000 + Math.PI;
    const cx = px + Math.cos(chAngle) * 22;
    const cy = py + Math.sin(chAngle) * 18 + 6;
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = crt(0.6);
    ctx.shadowColor = crt(0.8);
    ctx.shadowBlur = 5;
    ctx.fillText('\u22C6', cx - 5, cy);
  }

  // ── 8. 核心符号（武器决定 · CRT 主题色最大亮度）──
  ctx.shadowBlur = 0;
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = crt(1);
  ctx.shadowColor = crt(1);
  ctx.shadowBlur = wp.glowRadius || 16;
  ctx.fillText(wp.symbol, px - 14, py + 12);

  // ── 9. 武器名(小字 · CRT 主题色低亮) ──
  if (eq.weapon && eq.weapon.templateId !== 'default_thought') {
    ctx.font = '10px monospace';
    ctx.fillStyle = crt(0.5);
    ctx.shadowBlur = 0;
    ctx.fillText(eq.weapon.name, px - 24, py - 28);
  }

  ctx.shadowBlur = 0;
}

// ============================================================
// 主渲染函数
// ============================================================

/**
 * 渲染一帧 — 绘制顺序: 背景 → 地面 → 掉落 → 敌人 → 血渣 → 投射物 → 粒子 → 飘字 → 玩家
 * @param {number} now - performance.now() 时间戳
 */
export function render(now) {
  const ctx = world.ctx;
  // 修复7：直接写入静态复用对象，避免每帧 new {x, y}
  getShakeOffset(_shakeVec);

  ctx.save();
  ctx.translate(_shakeVec.x, _shakeVec.y);

  // ── 1. 清屏（CRT 屏幕底色，跟随主题）──
  ctx.fillStyle = crtBg(1);
  ctx.fillRect(-10, -10, (world.canvas?.width || 800) + 20, (world.canvas?.height || 320) + 20);

  // ── 2. 地面线（CRT 文字色 · 低亮）──
  ctx.strokeStyle = crt(0.3);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo((world.canvas?.width || 800), GROUND_Y);
  ctx.stroke();

  // ── 3. 背景滚动符 ──
  drawBackground(ctx, now);

  // ── 4. 玩家 (装备外观系统 v7.1) ──
  drawPlayer(ctx, now);

  // ── 5. 装备掉落（CRT 主题色 · 脉冲高亮 + 闪烁警告）──
  ctx.shadowBlur = 0;
  for (const d of world.drops) {
    if (d.dead) continue;
    const pulse = d.landed ? (0.5 + 0.5 * Math.sin(now / 200)) : 1;
    const urgency = d.life < 5000 ? (1 + 0.3 * Math.sin(now / 100)) : 1;
    ctx.font = `bold ${d.landed ? 20 : 18}px monospace`;
    ctx.fillStyle = crt(0.9);
    if (d.landed) {
      ctx.globalAlpha = urgency;
      ctx.shadowColor = crt(1);
      ctx.shadowBlur = 8 * pulse * urgency;
    }
    ctx.fillText('\u25C6', d.x - 8, d.y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    if (d.landed) {
      ctx.font = '10px monospace';
      ctx.fillStyle = crt(0.6);
      ctx.fillText(d.item.name, d.x - 30, d.y - 14);
    }
  }

  // ── 6. 血渣（CRT 主题色 · 低亮残影）──
  ctx.font = '12px monospace';
  for (const g of world.gore) {
    const a = Math.max(0.1, g.life / 2000);
    ctx.fillStyle = crt(Math.min(a * 0.5, 0.4));
    ctx.fillText(g.symbol, g.x, g.y);
  }

  // ── 7. 敌人（CRT 单色系统·阴影批量渲染：将敌人分两组避免频繁切换 shadowBlur）──
  // 先画无光晕敌人（shadowBlur=0），再画有光晕敌人（shadowBlur 只设一次）
  const enemiesNoGlow = [];
  const enemiesGlow = [];
  for (const e of world.enemies) {
    if (e.dead) continue;
    if (e.dying) { enemiesNoGlow.push(e); continue; }
    const flashing = now < e.flashUntil;
    const needGlow = flashing || e.type === 'boss' || e.type === 'elite';
    if (needGlow) enemiesGlow.push(e); else enemiesNoGlow.push(e);
  }

  // 批次 A：无光晕敌人（shadowBlur = 0，最快路径）
  ctx.shadowBlur = 0;
  for (const e of enemiesNoGlow) {
    drawEnemySymbol(ctx, e, now);
    drawEnemyHpBar(ctx, e);
    drawEnemyName(ctx, e);
  }

  // 批次 B：有光晕敌人（统一设 shadowBlur，避免每个敌人 toggle）
  if (enemiesGlow.length > 0) {
    ctx.shadowColor = crt(1);
    for (const e of enemiesGlow) {
      const flashing = now < e.flashUntil;
      // 只在不同 glow 值时才切换 shadowBlur（boss 8 / elite 4 / normal flash 6）
      const targetBlur = flashing ? 6 : e.type === 'boss' ? 8 : 4;
      if (ctx.shadowBlur !== targetBlur) ctx.shadowBlur = targetBlur;
      drawEnemySymbol(ctx, e, now, false);
    }
    ctx.shadowBlur = 0;
    // 血条和名字画在光晕之外（避免阴影干扰）
    for (const e of enemiesGlow) {
      drawEnemyHpBar(ctx, e);
      drawEnemyName(ctx, e);
    }
  }

  // ── 8. 投射物（全部有光晕，统一设一次 shadowBlur）──
  ctx.font = 'bold 22px monospace';
  ctx.shadowColor = crt(1);
  ctx.shadowBlur = 6;
  for (const p of world.projectiles) {
    if (p.dead) continue;
    ctx.fillStyle = crt(1);
    ctx.fillText(p.symbol || '*', p.x - 6, p.y + 6);
  }
  ctx.shadowBlur = 0;

  // ── 9. 飘字 — 伤害/暴击/系统信息（暴击有光晕，归并到一次 shadowBlur 批量）──
  ctx.textAlign = 'center';
  for (const t of world.damageTexts) {
    const a = Math.max(0, t.life / 800);
    if (typeof t.value === 'string') {
      ctx.fillStyle = crt(a * 0.7);
      ctx.font = 'bold 16px monospace';
      ctx.fillText(t.value, t.x, t.y);
    } else if (t.isCrit) {
      ctx.fillStyle = crt(a);
      if (ctx.shadowBlur !== 10) {
        ctx.shadowColor = crt(a);
        ctx.shadowBlur = 10;
      }
      ctx.font = 'bold 22px monospace';
      ctx.fillText(t.value.toString(), t.x, t.y);
    } else {
      if (ctx.shadowBlur !== 0) ctx.shadowBlur = 0;
      ctx.fillStyle = crt(a * 0.7);
      ctx.font = 'bold 14px monospace';
      ctx.fillText(t.value.toString(), t.x, t.y);
    }
  }
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';

  // ── 10. 粒子（CRT 主题色 · 低亮闪烁）──
  ctx.font = '14px monospace';
  for (const p of world.particles) {
    const a = Math.max(0, p.life / 400);
    ctx.fillStyle = crt(a * 0.5);
    ctx.fillText(p.symbol, p.x, p.y);
  }

  ctx.restore();
}

// ════════════════════════════════════════════════════════════
// 敌人绘制辅助函数（批量渲染优化：分离 symbol / hp bar / name）
// ════════════════════════════════════════════════════════════

function drawEnemySymbol(ctx, e, now, includeGlow = true) {
  const alpha = e.dying ? e.dyingAlpha : 1;
  if (alpha < 1) ctx.globalAlpha = alpha;
  const flashing = now < e.flashUntil;
  let enemyAlpha;
  if (flashing) enemyAlpha = 1;
  else if (e.type === 'boss') enemyAlpha = 1;
  else if (e.type === 'elite') enemyAlpha = 0.85;
  else enemyAlpha = 0.6;
  ctx.fillStyle = crt(enemyAlpha);
  ctx.font = 'bold 22px monospace';
  ctx.fillText(e.symbol, e.x - 10, e.y + 8);
  if (alpha < 1) ctx.globalAlpha = 1;
}

function drawEnemyHpBar(ctx, e) {
  if (e.dead || e.dying) return;
  const hpPct = Math.max(0, e.hp / e.maxHp);
  const barW = e.type === 'boss' ? BOSS_BAR_WIDTH : e.type === 'elite' ? ELITE_BAR_WIDTH : NORMAL_BAR_WIDTH;
  ctx.fillStyle = crt(0.12);
  ctx.fillRect(e.x - barW / 2, e.y - 16, barW, 2);
  if (e.type === 'boss' && e.phaseData) {
    const phases = e.phaseData.phases;
    for (let i = 1; i < phases.length; i++) {
      const markX = e.x - barW / 2 + barW * phases[i].hpPct;
      ctx.fillStyle = e.triggeredPhases?.has(i) ? crt(1) : crt(0.25);
      ctx.fillRect(markX - 0.5, e.y - 18, 1, 5);
    }
  }
  const barAlpha = e.type === 'boss' ? 1 : e.type === 'elite' ? 0.8 : 0.6;
  ctx.fillStyle = crt(barAlpha);
  ctx.fillRect(e.x - barW / 2, e.y - 16, barW * hpPct, 2);
  if (e.type === 'boss' && e.phaseData) {
    const cur = e.phaseData.phases[e.currentPhase];
    ctx.font = '9px monospace';
    ctx.fillStyle = crt(0.8);
    ctx.textAlign = 'left';
    ctx.fillText(cur.name, e.x + barW / 2 + 4, e.y - 14);
    ctx.textAlign = 'left';
  }
}

function drawEnemyName(ctx, e) {
  if (e.dead || e.dying) return;
  ctx.font = '10px monospace';
  const nameAlpha = e.type === 'boss' ? 0.8 : e.type === 'elite' ? 0.6 : 0.3;
  ctx.fillStyle = crt(nameAlpha);
  ctx.fillText(e.name, e.x - 18, e.y - 20);
}
