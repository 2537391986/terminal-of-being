// js/core/renderer.js
// Canvas 2D 渲染器 — 从 main.js 提取 (v6.2 架构拆分)
// 统一管理所有绘制调用, main.js 只调用 render(now)
// v7.1: 装备外观系统 + 武器特有攻击效果
// v0.8.1: shakeOff 改为静态复用对象，消灭 getShakeOffset() 每帧 new {x,y} 的 GC 压力

import { world, PLAYER_X, PLAYER_Y, CANVAS_W, CANVAS_H, GROUND_Y, SCROLL_SPEED } from './world.js';
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

/** 将 hex 颜色转为 rgba 字符串 */
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** 获取带透明度的 CSS 变量颜色 */
function getColorAlpha(name, alpha) {
  const hex = getColor(name);
  if (hex.startsWith('#')) return hexToRgba(hex, alpha);
  return hex;
}

/** 清除颜色缓存（主题切换时调用） */
export function refreshColorCache() {
  for (const key of Object.keys(_colorCache)) {
    delete _colorCache[key];
  }
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

function initBg() {
  for (let i = 0; i < 15; i++) {
    bgChars.push({
      x: Math.random() * CANVAS_W,
      y: Math.random() * CANVAS_H,
      symbol: ['\u00B7', '\u00B0', '\u02D9'][Math.floor(Math.random() * 3)],
      speed: 15 + Math.random() * 20,
      alpha: 0.04 + Math.random() * 0.04,
    });
  }
}
initBg();

let _lastBgTime = 0;

function drawBackground(ctx, now) {
  const dt = (_lastBgTime === 0) ? 1 / 60 : Math.min((now - _lastBgTime) / 1000, 0.1);
  _lastBgTime = now;
  ctx.font = '12px monospace';
  for (const c of bgChars) {
    c.x -= (SCROLL_SPEED + c.speed) * dt;
    if (c.x < -5) { c.x = CANVAS_W + 5; c.y = Math.random() * CANVAS_H; }
    ctx.fillStyle = `rgba(0, 255, 136, ${c.alpha})`;
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

  // ── 1. 躯体光晕（装备总稀有度决定亮度） ──
  let maxRarity = 0;
  for (const slot of Object.keys(eq)) {
    const item = Array.isArray(eq[slot]) ? eq[slot].find(i => i !== null) : eq[slot];
    if (!item) continue;
    const rv = { common: 0, magic: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 }[item.rarity] || 0;
    if (rv > maxRarity) maxRarity = rv;
  }
  if (maxRarity >= 3) {
    const pulse = 0.5 + 0.5 * Math.sin(now / 800 + maxRarity);
    ctx.shadowColor = maxRarity >= 5 ? '#fff' : maxRarity >= 4 ? '#ffa' : '#afa';
    ctx.shadowBlur = 6 + maxRarity * 4 + pulse * 10;
  }

  // ── 2. 胸部装备 — 将符号画在两侧 ──
  if (eq.chest) {
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#8888cc';
    ctx.shadowColor = '#8888cc';
    ctx.shadowBlur = 2;
    ctx.fillText('[', px - 22, py + 4);
    ctx.fillText(']', px + 8, py + 4);
  }

  // ── 3. 头部 — 冠冕 ──
  if (eq.head) {
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = eq.head.rarity === 'epic' ? '#ffcc00' : '#aaccff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 3;
    ctx.fillText('\u265B', px - 12, py - 18);
  }

  // ── 4. 靴子 ──
  if (eq.boots) {
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#88cc88';
    ctx.shadowColor = '#88cc88';
    ctx.shadowBlur = 2;
    ctx.fillText('__', px - 10, py + 18);
  }

  // ── 5. 戒指 — 旋转星点 ──
  if (eq.ring && (eq.ring[0] || eq.ring[1])) {
    const ringAngle = now / 600;
    const rx = px + Math.cos(ringAngle) * 24;
    const ry = py + Math.sin(ringAngle) * 14 + 4;
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffdd88';
    ctx.shadowColor = '#ffdd88';
    ctx.shadowBlur = 4;
    ctx.fillText('\u25C6', rx - 5, ry);
  }

  // ── 6. 护符 — 旋转星点 ──
  if (eq.amulet) {
    const amAngle = now / 800 + Math.PI / 2;
    const ax = px + Math.cos(amAngle) * 20;
    const ay = py + Math.sin(amAngle) * 20 - 6;
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#ffaa44';
    ctx.shadowColor = '#ffaa44';
    ctx.shadowBlur = 6;
    ctx.fillText('\u2726', ax - 6, ay);
  }

  // ── 7. 护身符 — 旋转星点 ──
  if (eq.charm) {
    const chAngle = now / 1000 + Math.PI;
    const cx = px + Math.cos(chAngle) * 22;
    const cy = py + Math.sin(chAngle) * 18 + 6;
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ff88cc';
    ctx.shadowColor = '#ff88cc';
    ctx.shadowBlur = 5;
    ctx.fillText('\u22C6', cx - 5, cy);
  }

  // ── 8. 核心符号（武器决定） ──
  ctx.shadowBlur = 0;
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = wp.glowColor;
  ctx.shadowColor = wp.glowColor;
  ctx.shadowBlur = wp.glowRadius;
  ctx.fillText(wp.symbol, px - 14, py + 12);

  // ── 9. 武器名(小字,悬浮在符号上方) ──
  if (eq.weapon && eq.weapon.templateId !== 'default_thought') {
    ctx.font = '10px monospace';
    ctx.fillStyle = wp.glowColor;
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

  // ── 1. 清屏 ──
  ctx.fillStyle = getColor('--bg-panel');
  ctx.fillRect(-10, -10, CANVAS_W + 20, CANVAS_H + 20);

  // ── 2. 地面线 ──
  ctx.strokeStyle = getColor('--dim');
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_W, GROUND_Y);
  ctx.stroke();

  // ── 3. 背景滚动符 ──
  drawBackground(ctx, now);

  // ── 4. 玩家 (装备外观系统 v7.1) ──
  drawPlayer(ctx, now);

  // ── 5. 装备掉落 (在地面上方,脉冲 + 过期警告) ──
  ctx.shadowBlur = 0;
  for (const d of world.drops) {
    if (d.dead) continue;
    const pulse = d.landed ? (0.5 + 0.5 * Math.sin(now / 200)) : 1;
    const urgency = d.life < 5000 ? (1 + 0.3 * Math.sin(now / 100)) : 1;
    ctx.font = `bold ${d.landed ? 20 : 18}px monospace`;
    ctx.fillStyle = d.item.color;
    if (d.landed) {
      ctx.globalAlpha = urgency;
      ctx.shadowColor = d.item.color;
      ctx.shadowBlur = 8 * pulse * urgency;
    }
    ctx.fillText('\u25C6', d.x - 8, d.y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    if (d.landed) {
      ctx.font = '10px monospace';
      ctx.fillStyle = d.item.color;
      ctx.fillText(d.item.name, d.x - 30, d.y - 14);
    }
  }

  // ── 6. 血渣 (在敌人下方) ──
  ctx.font = '12px monospace';
  for (const g of world.gore) {
    const a = Math.max(0.2, g.life / 2000);
    ctx.fillStyle = `rgba(180, 30, 30, ${a})`;
    ctx.fillText(g.symbol, g.x, g.y);
  }

  // ── 7. 敌人 (含符号+血条+阶段标记+名称) — 单次遍历 ──
  for (const e of world.enemies) {
    if (e.dead) continue;
    const alpha = e.dying ? e.dyingAlpha : 1;
    const flashing = now < e.flashUntil;
    if (alpha < 1) ctx.globalAlpha = alpha;
    ctx.fillStyle = flashing ? '#fff'
      : e.type === 'boss' ? getColor('--red')
      : e.type === 'elite' ? getColor('--amber')
      : '#ccc';
    if (flashing) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 6; }
    ctx.font = 'bold 22px monospace';
    ctx.fillText(e.symbol, e.x - 10, e.y + 8);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    if (!e.dying) {
      const hpPct = Math.max(0, e.hp / e.maxHp);
      const barW = e.type === 'boss' ? BOSS_BAR_WIDTH : e.type === 'elite' ? ELITE_BAR_WIDTH : NORMAL_BAR_WIDTH;
      // 血条底
      ctx.fillStyle = getColor('--dim');
      ctx.fillRect(e.x - barW / 2, e.y - 16, barW, 2);
      // ★ Boss 阶段标记
      if (e.type === 'boss' && e.phaseData) {
        const phases = e.phaseData.phases;
        for (let i = 1; i < phases.length; i++) {
          const markX = e.x - barW / 2 + barW * phases[i].hpPct;
          ctx.fillStyle = e.triggeredPhases?.has(i) ? '#fff' : '#666';
          ctx.fillRect(markX - 0.5, e.y - 18, 1, 5);
        }
      }
      // 血条填充
      ctx.fillStyle = e.type === 'boss' ? getColor('--red') : e.type === 'elite' ? getColor('--amber') : getColor('--green-bright');
      ctx.fillRect(e.x - barW / 2, e.y - 16, barW * hpPct, 2);
      // ★ Boss 当前阶段名称（右侧小字）
      if (e.type === 'boss' && e.phaseData) {
        const cur = e.phaseData.phases[e.currentPhase];
        ctx.font = '9px monospace';
        ctx.fillStyle = '#f88';
        ctx.textAlign = 'left';
        ctx.fillText(cur.name, e.x + barW / 2 + 4, e.y - 14);
        ctx.textAlign = 'left';
      }
    }
    // 敌人名称(小字,同上一个循环内完成,避免二次遍历)
    if (e.dead || e.dying) continue;
    ctx.font = '10px monospace';
    ctx.fillStyle = e.type === 'boss' ? getColor('--red') : e.type === 'elite' ? getColor('--amber') : '#555';
    ctx.fillText(e.name, e.x - 18, e.y - 20);
  }

  // ── 8. 投射物 (v7.1 武器特有符号+颜色) ──
  ctx.font = 'bold 22px monospace';
  for (const p of world.projectiles) {
    if (p.dead) continue;
    ctx.fillStyle = p.color || getColor('--green-bright');
    ctx.shadowColor = p.color || getColor('--green-bright');
    ctx.shadowBlur = 6;
    ctx.fillText(p.symbol || '*', p.x - 6, p.y + 6);
  }
  ctx.shadowBlur = 0;

  // ── 9. 飘字 ──
  ctx.textAlign = 'center';
  for (const t of world.damageTexts) {
    const a = Math.max(0, t.life / 800);
    if (typeof t.value === 'string') {
      ctx.fillStyle = `rgba(0, 255, 136, ${a})`;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(t.value, t.x, t.y);
    } else if (t.isCrit) {
      ctx.fillStyle = `rgba(255, 220, 80, ${a})`;
      ctx.font = 'bold 22px monospace';
      ctx.fillText(t.value.toString(), t.x, t.y);
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(t.value.toString(), t.x, t.y);
    }
  }
  ctx.textAlign = 'left';

  // ── 10. 粒子 ──
  ctx.font = '14px monospace';
  for (const p of world.particles) {
    const a = Math.max(0, p.life / 400);
    ctx.fillStyle = `rgba(255, 240, 180, ${a})`;
    ctx.fillText(p.symbol, p.x, p.y);
  }

  ctx.restore();
}
