// js/ui/inventory.js
// 背包/装备面板(DOM overlay)
// v8.2 — XSS 防护 + 事件委托替代 inline onclick

import { state } from '../core/state.js';
import { RARITIES, SLOTS, STAT_LABELS, INVENTORY_MAX } from '../data/constants.js';
import { equipItem, unequipItem, discardItem, sortInventory, rarityWeight } from '../systems/equipment.js';
import { recalcStats, formatStat } from '../systems/stats.js';
import { escapeHtml } from '../utils/html.js';

let panelEl = null;
let detailEl = null;
let selectedItemId = null;

// 初始化面板(在 DOM ready 后调用)
export function initInventoryUI() {
  panelEl = document.getElementById('inventory-panel');
  detailEl = document.getElementById('item-detail');

  document.getElementById('btn-inventory').onclick = togglePanel;
  document.getElementById('btn-sort').onclick = () => {
    sortInventory();
    renderPanel();
  };
  document.getElementById('btn-close-inv').onclick = () => {
    panelEl.classList.remove('show');
  };

  // 事件委托：点击背包物品 / 装备栏 / 详情按钮
  document.getElementById('inv-content').addEventListener('click', handleInvClick);
  detailEl.addEventListener('click', handleDetailClick);

  // 默认隐藏
  panelEl.classList.remove('show');
}

export function togglePanel() {
  const visible = panelEl.classList.contains('show');
  if (visible) {
    panelEl.classList.remove('show');
  } else {
    panelEl.classList.add('show');
    renderPanel();
  }
}

export function renderPanel() {
  if (!panelEl || !panelEl.classList.contains('show')) return;

  const container = document.getElementById('inv-content');
  if (!container) return;

  let html = '';

  // ── 装备栏 ──
  html += '<div class="inv-section"><h3>已装备</h3><div class="equip-grid">';
  for (const [slot, info] of Object.entries(SLOTS)) {
    if (slot === 'ring') {
      // 双戒指
      const rings = state.equipment.ring;
      for (let i = 0; i < 2; i++) {
        html += renderEquipSlot(slot, info, rings[i], i);
      }
    } else {
      html += renderEquipSlot(slot, info, state.equipment[slot]);
    }
  }
  html += '</div></div>';

  // ── 玩家属性总览 ──
  const fs = state.player.finalStats || {};
  html += '<div class="inv-section"><h3>属性总览</h3><div class="stats-grid">';
  for (const key of Object.keys(STAT_LABELS)) {
    if (fs[key] !== undefined && fs[key] !== 0) {
      html += `<span class="stat-item">${escapeHtml(formatStat(key, fs[key]))}</span>`;
    }
  }
  html += '</div></div>';

  // ── 背包 ──
  html += `<div class="inv-section"><h3>背包 (${state.inventory.length}/${INVENTORY_MAX})</h3>`;
  html += '<div class="inv-grid">';
  for (const item of state.inventory) {
    const sel = item.id === selectedItemId ? ' selected' : '';
    html += `<div class="inv-item${sel}" data-action="select" data-id="${escapeHtml(item.id)}">`;
    html += `<span class="inv-item-icon" style="color:${escapeHtml(item.color)}">\u25C6</span>`;
    html += `<span class="inv-item-name" style="color:${escapeHtml(item.color)}">${escapeHtml(item.name)}</span>`;
    html += `<span class="inv-item-rarity">${escapeHtml(RARITIES[item.rarity]?.label || '')}</span>`;
    html += '</div>';
  }
  html += '</div></div>';

  container.innerHTML = html;

  // 渲染详情(如果有选中)
  renderDetail();

  // ── 更新底栏 ──
  const footerEl = document.getElementById('inv-footer');
  if (footerEl) {
    let equipped = 0;
    for (const s of Object.keys(SLOTS)) {
      if (s === 'ring') {
        equipped += (state.equipment.ring || []).filter(Boolean).length;
      } else {
        if (state.equipment[s]) equipped++;
      }
    }
    const totalSlots = Object.keys(SLOTS).length + 1;
    footerEl.textContent = `slots: ${equipped}/${totalSlots} equipped · inv: ${state.inventory.length}/${INVENTORY_MAX} · last sort: default`;
  }
}

function renderEquipSlot(slot, slotInfo, item, ringIdx = -1) {
  const label = ringIdx >= 0 ? `${slotInfo.label}${ringIdx + 1}` : slotInfo.label;

  if (item) {
    return `<div class="equip-slot filled" data-action="unequip" data-slot="${escapeHtml(slot)}" data-ring-idx="${ringIdx}" title="点击卸下">
      <span class="slot-label">${escapeHtml(label)}</span>
      <span class="slot-item" style="color:${escapeHtml(item.color)}">${escapeHtml(item.name)}</span>
      <span class="slot-rarity">${escapeHtml(RARITIES[item.rarity]?.label || '')}</span>
    </div>`;
  }
  return `<div class="equip-slot empty">
    <span class="slot-label">${escapeHtml(label)}</span>
    <span class="slot-empty">— 空 —</span>
  </div>`;
}

function renderDetail() {
  if (!detailEl) return;
  if (!selectedItemId) {
    detailEl.innerHTML = '<p class="detail-hint">点击背包装备查看详情</p>';
    return;
  }

  const item = state.inventory.find(i => i.id === selectedItemId);
  if (!item) {
    detailEl.innerHTML = '';
    return;
  }

  let html = '';
  // 名称 + 稀有度
  html += `<div class="detail-header" style="border-color:${escapeHtml(item.color)}">`;
  html += `<span class="detail-name" style="color:${escapeHtml(item.color)}">${escapeHtml(item.name)}</span>`;
  html += `<span class="detail-rarity" style="color:${escapeHtml(item.color)}">${escapeHtml(RARITIES[item.rarity]?.label || '')}</span>`;
  html += `<span class="detail-slot">${escapeHtml(SLOTS[item.slot]?.label || item.slot)} \u00B7 Lv.${escapeHtml(item.level)}</span>`;
  html += '</div>';

  // 基础属性
  html += '<div class="detail-stats">';
  for (const [key, val] of Object.entries(item.stats || {})) {
    html += `<div class="detail-stat">${escapeHtml(formatStat(key, val))}</div>`;
  }
  html += '</div>';

  // 词缀
  if (item.affixes && item.affixes.length > 0) {
    html += '<div class="detail-affixes">';
    for (const affix of item.affixes) {
      html += `<div class="detail-affix">`;
      html += `<span class="affix-name">${escapeHtml(affix.name)}</span> `;
      for (const [key, val] of Object.entries(affix.stats || {})) {
        html += `<span class="affix-stat">${escapeHtml(formatStat(key, val))}</span>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }

  // 特殊效果
  if (item.effect) {
    html += `<div class="detail-effect"><span class="effect-label">特殊:</span> ${escapeHtml(item.effect.description)}</div>`;
  }

  // 概念说明
  if (item.concept) {
    html += '<div class="detail-concept">';
    html += `<div class="concept-term">${escapeHtml(item.concept.term)}</div>`;
    html += `<div class="concept-school">${escapeHtml(item.concept.school)}</div>`;
    html += `<div class="concept-summary">${escapeHtml(item.concept.summary)}</div>`;

    // 可折叠哲学档案（origin / influence / misconception）
    if (item.concept.origin || item.concept.influence || item.concept.misconception) {
      html += `<div class="concept-archive-toggle" data-action="toggle-archive">`;
      html += `\u25B8 展开哲学档案</div>`;
      html += '<div class="concept-archive">';
      if (item.concept.origin) {
        html += `<div class="archive-section"><span class="archive-label">\u25B8 历史背景</span><p>${escapeHtml(item.concept.origin)}</p></div>`;
      }
      if (item.concept.influence) {
        html += `<div class="archive-section"><span class="archive-label">\u25B8 思想影响</span><p>${escapeHtml(item.concept.influence)}</p></div>`;
      }
      if (item.concept.misconception) {
        html += `<div class="archive-section"><span class="archive-label">\u25B8 常见误解</span><p>${escapeHtml(item.concept.misconception)}</p></div>`;
      }
      html += '</div>';
    }

    if (item.concept.designNote) {
      html += `<div class="concept-design-note">\u25C6 ${escapeHtml(item.concept.designNote)}</div>`;
    }
    html += '</div>';
  }

  // 风味文字
  if (item.flavorText) {
    html += `<div class="detail-flavor">"${escapeHtml(item.flavorText)}"</div>`;
  }

  // 操作按钮
  html += '<div class="detail-actions">';
  html += `<button class="btn-equip" data-action="equip" data-id="${escapeHtml(item.id)}">装备</button>`;
  html += `<button class="btn-discard" data-action="discard" data-id="${escapeHtml(item.id)}">丢弃</button>`;
  html += '</div>';

  detailEl.innerHTML = html;
}

// ============================================================
// 事件委托 — 替代 inline onclick + window 全局函数
// ============================================================

function handleInvClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'select') {
    selectedItemId = target.dataset.id;
    renderPanel();
  } else if (action === 'unequip') {
    const slot = target.dataset.slot;
    const ringIdx = parseInt(target.dataset.ringIdx, 10);
    if (unequipItem(slot, ringIdx >= 0 ? ringIdx : undefined)) {
      recalcStats();
      renderPanel();
    }
  } else if (action === 'toggle-archive') {
    target.classList.toggle('open');
    target.nextElementSibling?.classList.toggle('expanded');
  }
}

function handleDetailClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === 'equip') {
    if (equipItem(id)) {
      recalcStats();
      selectedItemId = null;
      renderPanel();
    }
  } else if (action === 'discard') {
    if (discardItem(id)) {
      selectedItemId = null;
      renderPanel();
    }
  }
}
