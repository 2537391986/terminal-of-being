// js/utils/html.js
// HTML 安全工具 — 防止 XSS 注入

/**
 * 转义 HTML 特殊字符，防止 innerHTML 注入
 * @param {string} str - 需要转义的原始字符串
 * @returns {string} 转义后的安全字符串
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 面板关闭动画 — 先播放下落动画再隐藏
 * 需要 CSS 中定义 .panel-frame.closing 和 @keyframes pageFall
 * @param {HTMLElement} panelEl - overlay-panel 元素
 */
export function animateClose(panelEl) {
  if (!panelEl) return;
  const frame = panelEl.querySelector('.panel-frame');
  if (!frame) {
    panelEl.classList.remove('show');
    return;
  }
  // 避免重复触发关闭动画
  if (frame.classList.contains('closing')) return;
  frame.classList.add('closing');
  frame.addEventListener('animationend', function onEnd() {
    frame.removeEventListener('animationend', onEnd);
    frame.classList.remove('closing');
    panelEl.classList.remove('show');
  }, { once: true });
}
