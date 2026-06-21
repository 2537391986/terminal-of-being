// js/ui/inventory.js
// 背包/装备面板(DOM overlay)

import { state } from '../core/state.js';
import { RARITIES, SLOTS, STAT_LABELS, INVENTORY_MAX } from '../data/constants.js';
import { equipItem, unequipItem, discardItem, sortInventory, rarityWeight } from '../systems/equipment.js';
import { recalcStats, formatStat } from '../systems/stats.js';

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
    panelEl.style.display = 'none';
  };

  // 默认隐藏
  panelEl.style.display = 'none';
}

export function togglePanel() {
  const visible = panelEl.style.display !== 'none';
  panelEl.style.display = visible ? 'none' : 'flex';
  if (!visible) renderPanel();
}

export function renderPanel() {
  if (!panelEl || panelEl.style.display === 'none') return;

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
      html += `<span class="stat-item">${formatStat(key, fs[key])}</span>`;
    }
  }
  html += '</div></div>';

  // ── 背包 ──
  html += `<div class="inv-section"><h3>背包 (${state.inventory.length}/${INVENTORY_MAX})</h3>`;
  html += '<div class="inv-grid">';
  for (const item of state.inventory) {
    const sel = item.id === selectedItemId ? ' selected' : '';
    html += `<div class="inv-item${sel}" data-id="${item.id}" onclick="window._invSelectItem('${item.id}')">`;
    html += `<span class="inv-item-icon" style="color:${item.color}">◆</span>`;
    html += `<span class="inv-item-name" style="color:${item.color}">${item.name}</span>`;
    html += `<span class="inv-item-rarity">${RARITIES[item.rarity]?.label || ''}</span>`;
    html += '</div>';
  }
  html += '</div></div>';

  container.innerHTML = html;

  // 渲染详情(如果有选中)
  renderDetail();
}

function renderEquipSlot(slot, slotInfo, item, ringIdx = -1) {
  const label = ringIdx >= 0 ? `${slotInfo.label}${ringIdx + 1}` : slotInfo.label;
  const unequipAction = ringIdx >= 0
    ? `window._invUnequip('${slot}', ${ringIdx})`
    : `window._invUnequip('${slot}')`;

  if (item) {
    return `<div class="equip-slot filled" onclick="${unequipAction}" title="点击卸下">
      <span class="slot-label">${label}</span>
      <span class="slot-item" style="color:${item.color}">${item.name}</span>
      <span class="slot-rarity">${RARITIES[item.rarity]?.label || ''}</span>
    </div>`;
  }
  return `<div class="equip-slot empty">
    <span class="slot-label">${label}</span>
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
  html += `<div class="detail-header" style="border-color:${item.color}">`;
  html += `<span class="detail-name" style="color:${item.color}">${item.name}</span>`;
  html += `<span class="detail-rarity" style="color:${item.color}">${RARITIES[item.rarity]?.label || ''}</span>`;
  html += `<span class="detail-slot">${SLOTS[item.slot]?.label || item.slot} · Lv.${item.level}</span>`;
  html += '</div>';

  // 基础属性
  html += '<div class="detail-stats">';
  for (const [key, val] of Object.entries(item.stats || {})) {
    html += `<div class="detail-stat">${formatStat(key, val)}</div>`;
  }
  html += '</div>';

  // 词缀
  if (item.affixes && item.affixes.length > 0) {
    html += '<div class="detail-affixes">';
    for (const affix of item.affixes) {
      html += `<div class="detail-affix">`;
      html += `<span class="affix-name">${affix.name}</span> `;
      for (const [key, val] of Object.entries(affix.stats || {})) {
        html += `<span class="affix-stat">${formatStat(key, val)}</span>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }

  // 特殊效果
  if (item.effect) {
    html += `<div class="detail-effect"><span class="effect-label">特殊:</span> ${item.effect.description}</div>`;
  }

  // 概念说明
  if (item.concept) {
    html += '<div class="detail-concept">';
    html += `<div class="concept-term">${item.concept.term}</div>`;
    html += `<div class="concept-school">${item.concept.school}</div>`;
    html += `<div class="concept-summary">${item.concept.summary}</div>`;

    // 可折叠哲学档案（origin / influence / misconception）
    if (item.concept.origin || item.concept.influence || item.concept.misconception) {
      html += `<div class="concept-archive-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('expanded')">`;
      html += `▸ 展开哲学档案</div>`;
      html += '<div class="concept-archive">';
      if (item.concept.origin) {
        html += `<div class="archive-section"><span class="archive-label">▸ 历史背景</span><p>${item.concept.origin}</p></div>`;
      }
      if (item.concept.influence) {
        html += `<div class="archive-section"><span class="archive-label">▸ 思想影响</span><p>${item.concept.influence}</p></div>`;
      }
      if (item.concept.misconception) {
        html += `<div class="archive-section"><span class="archive-label">▸ 常见误解</span><p>${item.concept.misconception}</p></div>`;
      }
      html += '</div>';
    }

    if (item.concept.designNote) {
      html += `<div class="concept-design-note">◆ ${item.concept.designNote}</div>`;
    }
    html += '</div>';
  }

  // 风味文字
  if (item.flavorText) {
    html += `<div class="detail-flavor">"${item.flavorText}"</div>`;
  }

  // 操作按钮
  html += '<div class="detail-actions">';
  html += `<button class="btn-equip" onclick="window._invEquip('${item.id}')">装备</button>`;
  html += `<button class="btn-discard" onclick="window._invDiscard('${item.id}')">丢弃</button>`;
  html += '</div>';

  detailEl.innerHTML = html;
}

// ── 全局回调(window 绑定) ──
window._invSelectItem = (id) => {
  selectedItemId = id;
  renderPanel();
};

window._invEquip = (id) => {
  if (equipItem(id)) {
    recalcStats();
    selectedItemId = null;
    renderPanel();
    // 同步 HUD
    if (window._updateHUD) window._updateHUD();
  }
};

window._invUnequip = (slot, ringIdx = 0) => {
  if (unequipItem(slot, ringIdx)) {
    recalcStats();
    renderPanel();
    if (window._updateHUD) window._updateHUD();
  }
};

window._invDiscard = (id) => {
  if (discardItem(id)) {
    selectedItemId = null;
    renderPanel();
  }
};
