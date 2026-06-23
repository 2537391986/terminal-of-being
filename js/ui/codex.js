// js/ui/codex.js
// 概念图鉴面板(已解锁的概念)
// v8.2 — XSS 防护 + 事件委托替代 inline onclick

import { state } from '../core/state.js';
import { CONCEPTS, findConcept } from '../data/concepts.js';
import { escapeHtml } from '../utils/html.js';

let panelEl = null;
let selectedId = null;

export function initCodexUI() {
  panelEl = document.getElementById('codex-panel');
  if (!panelEl) return;

  document.getElementById('btn-codex').onclick = togglePanel;
  document.getElementById('btn-close-codex').onclick = () => {
    panelEl.classList.remove('show');
  };

  // 事件委托：点击概念卡片
  const codexContent = document.getElementById('codex-content');
  if (codexContent) {
    codexContent.addEventListener('click', handleCodexClick);
  }

  panelEl.classList.remove('show');
}

function togglePanel() {
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

  const container = document.getElementById('codex-content');
  if (!container) return;

  // 已解锁的 id 列表
  const unlocked = state.unlockedCodex || [];

  if (unlocked.length === 0) {
    container.innerHTML = '<p class="codex-empty">尚未解锁任何概念。<br>击杀怪物来解锁它们的哲学内涵。</p>';
    const footerEl = document.getElementById('codex-footer');
    if (footerEl) footerEl.textContent = `concepts: 0 unlocked · archive: offline`;
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
    html += `<div class="codex-section"><h3>${escapeHtml(field)} (${concepts.length})</h3>`;
    for (const c of concepts) {
      const sel = c.id === selectedId ? ' selected' : '';
      html += `<div class="codex-card${sel}" data-action="select" data-id="${escapeHtml(c.id)}">`;
      html += `<span class="codex-term">${escapeHtml(c.term)}</span>`;
      html += `<span class="codex-school">${escapeHtml(c.school)}</span>`;
      html += `<span class="codex-summary">${escapeHtml(c.summary)}</span>`;
      html += '</div>';
    }
    html += '</div>';
  }

  container.innerHTML = html;

  // 如果有选中项,渲染详情
  renderDetail();

  // ── 更新底栏 ──
  const footerEl = document.getElementById('codex-footer');
  if (footerEl) {
    const unlocked = (state.unlockedCodex || []).length;
    footerEl.textContent = `concepts: ${unlocked} unlocked · archive: offline`;
  }
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
  html += `<h3>${escapeHtml(c.term)}</h3>`;
  html += `<div class="codex-meta">${escapeHtml(c.school)} \u00B7 ${escapeHtml(c.field)}</div>`;
  html += `<div class="codex-summary-full">${escapeHtml(c.summary)}</div>`;
  if (c.designNote) {
    html += `<div class="codex-design-note">\u25C6 ${escapeHtml(c.designNote)}</div>`;
  }
  if (c.termEn) {
    html += `<div class="codex-term-en">${escapeHtml(c.termEn)}</div>`;
  }
  html += '</div>';

  detailEl.innerHTML = html;
}

// ============================================================
// 事件委托 — 替代 inline onclick + window 全局函数
// ============================================================

function handleCodexClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  if (target.dataset.action === 'select') {
    selectedId = target.dataset.id;
    renderPanel();
  }
}
