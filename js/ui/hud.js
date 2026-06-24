// js/ui/hud.js
// HUD 显示更新 + 战斗日志系统
// v6.3 — 术语切换 + 悬停注释
// v8.2 — XSS 防护 + 日志增量渲染 + 函数重命名

import { state } from '../core/state.js';
import { world } from '../core/world.js';
import {
  STAT_LABELS, STAT_PLAIN_LABELS,
  STAT_SHORT_LABELS, STAT_SHORT_PLAIN,
  STAT_TOOLTIPS,
} from '../data/constants.js';
import { escapeHtml } from '../utils/html.js';

// ============================================================
// 术语获取
// ============================================================

/** 当前用哲学术语还是通俗术语 */
function usePlain() { return state.settings?.usePlainTerms || false; }

/** 获取属性全称 */
function getStatLabel(key) {
  return usePlain() ? (STAT_PLAIN_LABELS[key] || key) : (STAT_LABELS[key] || key);
}

/** 获取 HUD 速览行短标签 */
function getStatShortLabel(key) {
  return usePlain() ? (STAT_SHORT_PLAIN[key] || key) : (STAT_SHORT_LABELS[key] || key);
}

/** 获取属性悬停注释 */
function getStatTooltip(key) {
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
  // 版本号递增，用于 updateLog 增量检测（解决满80条时长度不变导致跳过渲染的bug）
  state._logVersion = (state._logVersion || 0) + 1;
}

/**
 * 根据消息内容自动检测日志类型
 * 标准化前缀：[击杀][击退][掉落][获得][升级][死亡][闪避][暴击][系统]
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

let _prevLogVersion = 0;
const MAX_LOG_DISPLAY = 50;

export function updateLog() {
  const curVersion = state._logVersion || 0;
  if (curVersion === _prevLogVersion) return;

  const logBox = document.getElementById('log');
  if (!logBox) return;

  _prevLogVersion = curVersion;

  // 全量重建：始终用最新的 MAX_LOG_DISPLAY 条重建 DOM
  // 不用增量渲染——日志是高频变化的文本流，增量 DOM 操作反而复杂且易出错
  const recent = state.logs.slice(-MAX_LOG_DISPLAY);
  logBox.innerHTML = recent.map(l => buildLogLine(l)).join('');
  logBox.scrollTop = logBox.scrollHeight;
}

/**
 * 构建单条日志的 HTML（已转义，防 XSS）
 */
function buildLogLine(l) {
  const msg = typeof l === 'string' ? l : l.msg;
  const type = typeof l === 'string' ? detectLogType(msg) : (l.type || 'stdout');
  const cls = ` class="log-${type}"`;
  const prefix = msg.startsWith('>') || msg.startsWith('[') ? '' : '> ';
  return `<div${cls}>${escapeHtml(prefix)}${escapeHtml(msg)}</div>`;
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
      el.textContent = getStatShortLabel(key);
      el.title = getStatTooltip(key);
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

  // ── SYSTEM STATUS（左栏）──
  safeText('player-hp', `${Math.max(0, Math.floor(state.player.hp))} / ${state.player.maxHp}`);
  safeText('player-mp', `${Math.floor(state.player.mp || 0)} / ${state.player.maxMp || 30}`);
  safeText('level', state.player.level);
  safeText('hud-atk', Math.floor(s.atk));
  safeText('hud-def', Math.floor(s.def));

  // ── SESSION INFO（右栏）──
  safeText('stage', state.stage);
  safeText('gold', Math.floor(state.player.gold));
  safeText('enemy-count', Math.max(0, world.waveEnemiesLeft));
  // CRT 监控区：敌人数量
  safeText('enemy-count-display', 'ENEMIES: ' + Math.max(0, world.waveEnemiesLeft));

  const isCombat = world.waveState === 'combat';
  const waveText = isCombat ? 'IN COMBAT' : 'EXPANDING';
  safeText('wave-state', waveText);
  // CRT 监控区：波次状态
  safeText('wave-display', 'STATUS: ' + (isCombat ? 'IN COMBAT' : 'NOMINAL'));
  const waveEl = document.getElementById('wave-state');
  if (waveEl) {
    waveEl.classList.toggle('active', isCombat);
    waveEl.style.color = isCombat ? '#cc0000' : '';
  }

  // ── 战斗画布氛围光 ──
  const combatEl = document.getElementById('combat');
  if (combatEl) combatEl.classList.toggle('in-combat', isCombat);

  // ── 经验条（ASCII 填充）──
  const expPct = Math.max(0, Math.min(1, state.player.exp / (state.player.expToNext || 1)));
  safeText('exp', `${Math.floor(state.player.exp)} / ${state.player.expToNext || 0}`);
  updateAsciiBar('exp-bar', expPct);
  // CRT 风格进度条（32 格带百分比）
  updateCrtProgressBar('exp-bar-crt', expPct);
  // CRT 信息区：存在强度百分比
  const expPctStr = (expPct * 100).toFixed(1) + '%';
  safeText('exp-pct-display', expPctStr);
  safeText('exp-pct-display-2', expPctStr);
  // CRT 信息区：存在指数（HP%）
  safeText('hp-pct-display', Math.round(hpPct * 100) + '%');

  // ── HP / MP 条（ASCII 填充）──
  const hpPct = Math.max(0, state.player.hp / (state.player.maxHp || 1));
  const mpPct = Math.max(0, (state.player.mp || 0) / (state.player.maxMp || 30));
  updateAsciiBar('player-hp-bar', hpPct);
  updateAsciiBar('player-mp-bar', mpPct);

  // ── ONTOLOGICAL METRICS ──
  safeText('hud-aspd', (s.aspd || 1).toFixed(2));
  safeText('hud-crit', ((s.crit || 0) * 100).toFixed(1) + '%');

  // ── 紧凑属性条（中等屏幕可见）──
  safeText('ss-atk', Math.floor(s.atk));
  safeText('ss-def', Math.floor(s.def));
  safeText('ss-crit', ((s.crit || 0) * 100).toFixed(1) + '%');
  safeText('ss-aspd', (s.aspd || 1).toFixed(2));

  const statusText = isCombat
    ? `STAGE ${state.stage} · ${world.waveEnemiesLeft} REM`
    : `REST · STAGE ${state.stage}`;
  safeText('terminal-status-text', statusText);

  // ── 页脚时间 ──
  const now = new Date();
  safeText('current-time', now.toTimeString().split(' ')[0]);
  // CRT 命令行区时间
  safeText('current-time-2', 'TIME: ' + now.toTimeString().split(' ')[0]);
  safeText('current-date', 'DATE: ' + now.toISOString().split('T')[0]);

  // ── 伪系统指标（每 3 秒微动）──
  updateFakeMetrics();

  updateLog();
}

function updateBar(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = (pct * 100).toFixed(1) + '%';
}

/** ASCII 进度条：10 格 █/░ 填充 */
function updateAsciiBar(id, pct) {
  const el = document.getElementById(id);
  if (!el) return;
  const clamped = Math.max(0, Math.min(1, pct));
  const filled = Math.round(clamped * 10);
  el.textContent = '█'.repeat(filled) + '░'.repeat(10 - filled);
}

/** CRT 风格进度条：[████░░] XX.X%  · 32 格 */
function updateCrtProgressBar(id, pct) {
  const el = document.getElementById(id);
  if (!el) return;
  const clamped = Math.max(0, Math.min(1, pct));
  const totalSlots = 32;
  const filledSlots = Math.round(clamped * totalSlots);
  const emptySlots = totalSlots - filledSlots;
  let html = '<span class="bar-bracket">[</span>';
  html += '<span class="bar-fill">' + '█'.repeat(filledSlots) + '</span>';
  html += '<span class="bar-empty">' + '░'.repeat(emptySlots) + '</span>';
  html += '<span class="bar-bracket">]</span> ' + (pct * 100).toFixed(1) + '%';
  el.innerHTML = html;
}

// ============================================================
// 伪系统指标（纯装饰）
// ============================================================
let _lastMetricsTime = 0;
const METRICS_INTERVAL = 3000;

function updateFakeMetrics() {
  const now = Date.now();
  if (now - _lastMetricsTime < METRICS_INTERVAL) return;
  _lastMetricsTime = now;

  const memEl = document.getElementById('sys-mem');
  const cpuEl = document.getElementById('sys-cpu');
  const procEl = document.getElementById('sys-proc');

  if (memEl) {
    const mem = 48 + Math.floor(Math.random() * 80);
    memEl.textContent = `MEM:${mem}M`;
  }
  if (cpuEl) {
    const cpu = 1 + Math.floor(Math.random() * 11);
    cpuEl.textContent = `CPU:${cpu}%`;
  }
  if (procEl) {
    const proc = 5 + Math.floor(Math.random() * 6);
    procEl.textContent = `PROC:${proc}`;
  }
  // CRT 监控区：系统指标汇总行
  const sysDisp = document.getElementById('sys-display');
  if (sysDisp) {
    const mem = 48 + Math.floor(Math.random() * 80);
    const cpu = 1 + Math.floor(Math.random() * 11);
    const proc = 5 + Math.floor(Math.random() * 6);
    sysDisp.textContent = `MEM:${mem}M CPU:${cpu}% PROC:${proc}`;
  }
}

