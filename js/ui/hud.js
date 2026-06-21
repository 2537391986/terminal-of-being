// js/ui/hud.js
// HUD 显示更新 + 战斗日志系统
// v6.3 — 术语切换 + 悬停注释

import { state } from '../core/state.js';
import { world } from '../core/world.js';
import {
  STAT_LABELS, STAT_PLAIN_LABELS,
  STAT_SHORT_LABELS, STAT_SHORT_PLAIN,
  STAT_TOOLTIPS,
} from '../data/constants.js';

// ============================================================
// 术语获取
// ============================================================

/** 当前用哲学术语还是通俗术语 */
function usePlain() { return state.settings?.usePlainTerms || false; }

/** 获取属性全称 */
function label(key) {
  return usePlain() ? (STAT_PLAIN_LABELS[key] || key) : (STAT_LABELS[key] || key);
}

/** 获取 HUD 速览行短标签 */
function shortLabel(key) {
  return usePlain() ? (STAT_SHORT_PLAIN[key] || key) : (STAT_SHORT_LABELS[key] || key);
}

/** 获取属性悬停注释 */
function tooltip(key) {
  return STAT_TOOLTIPS[key] || '';
}

// ============================================================
// fs() 副本：最终属性读取
// ============================================================
let _getStats = null;

export function registerGetStats(fn) {
  _getStats = fn;
}

function getStats() {
  return _getStats ? _getStats() : (state.player.finalStats || state.player);
}

// ============================================================
// 战斗日志
// ============================================================
/**
 * 添加日志
 * @param {string} msg - 日志内容（可带 [TAG] 前缀自动识别类型）
 * @param {string} [type] - 可选强制指定类型: stdout/warn/err/loot/kill
 */
export function log(msg, type) {
  const detectedType = type || detectLogType(msg);
  state.logs.push({ t: Date.now(), msg, type: detectedType });
  if (state.logs.length > 80) state.logs.shift();
}

/**
 * 根据消息内容自动检测日志类型
 * §13 标准化前缀：[击杀][击退][掉落][获得][升级][死亡][闪避][暴击][系统]
 */
function detectLogType(msg) {
  // 击杀/击退/暴击 → 绿色
  if (/^\[?(命题被否证|击退|暴击)/.test(msg)) return 'kill';
  // 意志升阶 → 白色(stdout)
  if (/^\[?意志升阶/.test(msg)) return 'stdout';
  // 此在消散 → 红色(err)
  if (/^\[?此在消散/.test(msg)) return 'err';
  // 现象凝结/纳入存在 → 金色(loot)
  if (/^\[?(现象凝结|纳入存在)/.test(msg)) return 'loot';
  // 闪避 → 黄色(warn)
  if (/^\[?闪避/.test(msg)) return 'warn';
  // 涌现/存在卷轴/系统 → 白色(stdout)
  if (/^\[?(涌现|存在卷轴|系统)/.test(msg)) return 'stdout';
  // 概念收录/意志升阶 → 白色(stdout)
  if (/^\[?(概念收录|意志升阶)/.test(msg)) return 'stdout';
  // 范畴溢出 → 黄色(warn)
  if (/^\[?范畴溢出/.test(msg)) return 'warn';
  if (/^\[?(警告|注意|失败)/.test(msg)) return 'warn';
  if (/^\[?(错误|Error)/.test(msg)) return 'err';
  return 'stdout';
}

let _prevLogLen = 0;

export function updateLog() {
  if (state.logs.length === _prevLogLen) return;
  _prevLogLen = state.logs.length;
  const logBox = document.getElementById('log');
  const recent = state.logs.slice(-50);
  logBox.innerHTML = recent.map(l => {
    // 兼容旧格式（字符串）和新格式（{msg, type} 对象）
    const msg = typeof l === 'string' ? l : l.msg;
    const type = typeof l === 'string' ? detectLogType(msg) : (l.type || 'stdout');
    const cls = ` class="log-${type}"`;
    const prefix = msg.startsWith('>') || msg.startsWith('[') ? '' : '> ';
    return `<div${cls}>${prefix}${msg}</div>`;
  }).join('');
  logBox.scrollTop = logBox.scrollHeight;
}

// ============================================================
// HUD 主更新
// ============================================================

/** 初始化/刷新 HUD 静态标签（术语切换时调用） */
export function refreshHUDLabels() {
  const labels = [
    { id: 'hud-atk-label', key: 'atk' },
    { id: 'hud-def-label', key: 'def' },
    { id: 'hud-aspd-label', key: 'aspd' },
    { id: 'hud-crit-label', key: 'crit' },
  ];
  for (const { id, key } of labels) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = shortLabel(key);
      el.title = tooltip(key);
    }
  }
}

/**
 * 将全部 HUD DOM 元素同步到当前 state
 */
export function updateHUD() {
  const s = getStats();
  if (!s) return;

  const safeText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const safeStyle = (id, prop, val) => { const el = document.getElementById(id); if (el) el.style[prop] = val; };

  safeText('stage', state.stage);
  safeText('level', state.player.level);
  safeText('gold', state.player.gold);
  safeText('exp', `${Math.floor(state.player.exp)} / ${state.player.expToNext}`);
  safeText('player-hp', `${Math.max(0, Math.floor(state.player.hp))} / ${state.player.maxHp}`);
  safeText('player-mp', `${Math.floor(state.player.mp || 0)} / ${state.player.maxMp || 30}`);

  // 终端标题栏阶段信息
  safeText('title-stage', `STAGE ${state.stage}`);

  const pPct = Math.max(0, state.player.hp / state.player.maxHp) * 100;
  safeStyle('player-hp-bar', 'width', pPct + '%');

  const isCombat = world.waveState === 'combat';
  const waveText = isCombat
    ? `>> 辩驳中 (${Math.max(0, world.waveEnemiesLeft)}命题待否证)`
    : '>> 概念展开中…';
  safeText('wave-state', waveText);
  const waveColor = isCombat ? '#ff4444' : '#888';
  safeStyle('wave-state', 'color', waveColor);
  const waveEl = document.getElementById('wave-state');
  if (waveEl) waveEl.classList.toggle('active', isCombat);
  safeText('enemy-count', Math.max(0, world.waveEnemiesLeft));

  // 终端状态行
  const statusText = isCombat
    ? `涌现第 ${state.stage} 层 · ${world.waveEnemiesLeft} 个命题待否证`
    : `休息中 · 准备进入第 ${state.stage} 层`;
  safeText('terminal-status-text', statusText);

  // 属性速览行 — 数值
  safeText('hud-atk', Math.floor(s.atk));
  safeText('hud-def', Math.floor(s.def));
  safeText('hud-aspd', s.aspd.toFixed(2));
  safeText('hud-crit', (s.crit * 100).toFixed(1) + '%');

  updateLog();
}
