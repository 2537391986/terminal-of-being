// js/ui/statPoints.js
// 自由属性点分配面板

import { state } from '../core/state.js';
import { SPENDABLE_STATS, STAT_LABELS, STAT_PLAIN_LABELS } from '../data/constants.js';
import { recalcStats } from '../systems/stats.js';
import { getFinalStats } from '../systems/effects.js';

let panelEl = null;
let _syncCallback = null; // 同步属性回调
let _logCallback = null;  // 日志回调

/**
 * 初始化属性点面板
 * @param {Function} syncFn - 同步玩家属性的回调
 * @param {Function} logFn - 日志回调
 */
export function initStatPointsUI(syncFn, logFn) {
  _syncCallback = syncFn;
  _logCallback = logFn;
  panelEl = document.getElementById('statpoints-panel');

  const closeBtn = document.getElementById('btn-close-sp');
  if (closeBtn) closeBtn.onclick = closePanel;

  // 分配按钮事件委托
  if (panelEl) {
    panelEl.addEventListener('click', handleClick);
  }

  // 绑定 HUD 属性点按钮
  const hudBtn = document.getElementById('btn-statpoints');
  if (hudBtn) hudBtn.onclick = openPanel;

  // ESC 关闭 + 快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelEl?.classList.contains('show')) {
      e.preventDefault();
      closePanel();
    }
  });
}

export function openPanel() {
  if (!panelEl) return;
  panelEl.classList.add('show');
  renderPanel();
}

export function closePanel() {
  if (!panelEl) return;
  panelEl.classList.remove('show');
}

export function togglePanel() {
  if (!panelEl) return;
  if (panelEl.classList.contains('show')) closePanel();
  else openPanel();
}

function handleClick(e) {
  const btn = e.target.closest('.sp-btn');
  if (!btn) return;
  const key = btn.dataset.key;
  const action = btn.dataset.action; // '+' or '-'
  if (!key || !action) return;

  const cfg = SPENDABLE_STATS.find(s => s.key === key);
  if (!cfg) return;

  if (action === '+') {
    if ((state.player.statPoints || 0) <= 0) return;
    state.player.statPoints -= 1;
    if (!state.player.customStats) state.player.customStats = {};
    state.player.customStats[key] = (state.player.customStats[key] || 0) + cfg.perPoint;
  } else if (action === '-') {
    if (!state.player.customStats || (state.player.customStats[key] || 0) < cfg.perPoint) return;
    state.player.customStats[key] -= cfg.perPoint;
    state.player.statPoints = (state.player.statPoints || 0) + 1;
  }

  recalcStats();
  if (_syncCallback) _syncCallback();
  renderPanel();
}

function usePlain() { return state.settings?.usePlainTerms || false; }
function getLabel(key) {
  return usePlain() ? (STAT_PLAIN_LABELS[key] || key) : (STAT_LABELS[key] || key);
}

/** 格式化属性值显示 */
function formatValue(key) {
  const fs = getFinalStats();
  const val = fs ? fs[key] : 0;
  const ratioKeys = ['crit', 'critDmg', 'dodge', 'block', 'itemFind', 'rarityFind', 'expGain', 'goldGain', 'lifesteal', 'cooldownRed'];
  if (ratioKeys.includes(key)) return (val * 100).toFixed(1) + '%';
  if (key === 'aspd') return val.toFixed(2);
  return Math.floor(val);
}

/** 格式化每点增益 */
function formatPerPoint(key, perPoint) {
  const ratioKeys = ['crit', 'dodge'];
  if (ratioKeys.includes(key)) return '+' + (perPoint * 100).toFixed(0) + '%';
  if (key === 'aspd') return '+' + (perPoint * 100).toFixed(0) + '%';
  return '+' + perPoint;
}

function renderPanel() {
  const body = document.getElementById('sp-body');
  const pointsEl = document.getElementById('sp-points');
  if (!body || !pointsEl) return;

  const points = state.player.statPoints || 0;
  pointsEl.textContent = points;
  pointsEl.style.color = points > 0 ? 'var(--amber)' : 'var(--gray)';

  const cs = state.player.customStats || {};

  body.innerHTML = SPENDABLE_STATS.map(cfg => {
    const allocated = Math.round((cs[cfg.key] || 0) / cfg.perPoint);
    const label = getLabel(cfg.key);
    const current = formatValue(cfg.key);
    const pp = formatPerPoint(cfg.key, cfg.perPoint);
    const canAdd = points > 0;
    const canSub = allocated > 0;

    return `
      <div class="sp-row">
        <span class="sp-label" title="${label}">${label}</span>
        <span class="sp-current">${current}</span>
        <span class="sp-allocated">+${allocated}</span>
        <span class="sp-pp">${pp}/点</span>
        <div class="sp-actions">
          <button class="sp-btn sp-minus ${canSub ? '' : 'disabled'}" data-key="${cfg.key}" data-action="-">−</button>
          <button class="sp-btn sp-plus ${canAdd ? '' : 'disabled'}" data-key="${cfg.key}" data-action="+">+</button>
        </div>
      </div>
    `;
  }).join('');
}

/** 检查是否有未分配点数（供 HUD 闪烁提示用） */
export function hasUnspentPoints() {
  return (state.player.statPoints || 0) > 0;
}
