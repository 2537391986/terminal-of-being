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
