// js/ui/codex.js
// 概念图鉴面板(已解锁的概念)

import { state } from '../core/state.js';
import { CONCEPTS, findConcept } from '../data/concepts.js';

let panelEl = null;
let selectedId = null;

export function initCodexUI() {
  panelEl = document.getElementById('codex-panel');
  if (!panelEl) return;

  document.getElementById('btn-codex').onclick = togglePanel;
  document.getElementById('btn-close-codex').onclick = () => {
    panelEl.style.display = 'none';
  };
  panelEl.style.display = 'none';
}

function togglePanel() {
  const visible = panelEl.style.display !== 'none';
  panelEl.style.display = visible ? 'none' : 'flex';
  if (!visible) renderPanel();
}

export function renderPanel() {
  if (!panelEl || panelEl.style.display === 'none') return;

  const container = document.getElementById('codex-content');
  if (!container) return;

  // 已解锁的 id 列表
  const unlocked = state.unlockedCodex || [];

  if (unlocked.length === 0) {
    container.innerHTML = '<p class="codex-empty">尚未解锁任何概念。<br>击杀怪物来解锁它们的哲学内涵。</p>';
    return;
  }

  // 构建概念卡片(按 field 分组)
  const fields = { '哲学': [], '数学': [], '其他': [] };
  for (const id of unlocked) {
    const c = findConcept(id);
    if (!c) continue;
    const f = c.field === '数学' ? '数学' : c.field === '哲学' ? '哲学' : '其他';
    if (!fields[f]) fields[f] = [];
    fields[f].push(c);
  }

  let html = '';
  for (const [field, concepts] of Object.entries(fields)) {
    if (concepts.length === 0) continue;
    html += `<div class="codex-section"><h3>${field} (${concepts.length})</h3>`;
    for (const c of concepts) {
      const sel = c.id === selectedId ? ' selected' : '';
      html += `<div class="codex-card${sel}" data-id="${c.id}" onclick="window._codexSelect('${c.id}')">`;
      html += `<span class="codex-term">${c.term}</span>`;
      html += `<span class="codex-school">${c.school}</span>`;
      html += `<span class="codex-summary">${c.summary}</span>`;
      html += '</div>';
    }
    html += '</div>';
  }

  container.innerHTML = html;

  // 如果有选中项,渲染详情
  renderDetail();
}

function renderDetail() {
  const detailEl = document.getElementById('codex-detail');
  if (!detailEl) return;

  if (!selectedId) {
    detailEl.innerHTML = '<p class="detail-hint">点击概念查看详情</p>';
    return;
  }

  const c = findConcept(selectedId);
  if (!c) { detailEl.innerHTML = ''; return; }

  const isLocked = !(state.unlockedCodex || []).includes(c.id);
  let html = '';
  html += `<div class="codex-detail-inner ${isLocked ? 'locked' : ''}">`;
  html += `<h3>${c.term}</h3>`;
  html += `<div class="codex-meta">${c.school} · ${c.field}</div>`;
  html += `<div class="codex-summary-full">${c.summary}</div>`;
  if (c.designNote) {
    html += `<div class="codex-design-note">◆ ${c.designNote}</div>`;
  }
  if (c.termEn) {
    html += `<div class="codex-term-en">${c.termEn}</div>`;
  }
  html += '</div>';

  detailEl.innerHTML = html;
}

// 全局回调
window._codexSelect = (id) => {
  selectedId = id;
  renderPanel();
};
