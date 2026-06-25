// js/ui/theme.js
// CRT 终端三套主题切换（paper / amber / mono）
// v1.1 — 修复默认主题 mismatch + Canvas 颜色缓存刷新

import { refreshColorCache } from '../core/renderer.js';

const THEMES = ['paper', 'amber', 'mono'];
const THEME_NAMES = {
  paper: 'PAPER-WHITE',
  amber: 'AMBER CRT',
  mono: 'MONO GLOW',
};

/** 从 DOM / localStorage 读取当前主题索引 */
function detectCurrentThemeIdx() {
  try {
    const saved = localStorage.getItem('crt-theme');
    if (saved && THEMES.includes(saved)) return THEMES.indexOf(saved);
  } catch (e) {}
  // 回退：读 HTML 上 data-theme（默认 mono）
  const domTheme = document.documentElement.getAttribute('data-theme');
  if (domTheme && THEMES.includes(domTheme)) return THEMES.indexOf(domTheme);
  return 2; // 默认 mono
}

let _currentThemeIdx = detectCurrentThemeIdx();

/** 应用主题到 DOM */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  try { localStorage.setItem('crt-theme', theme); } catch (e) {}
  // 同步更新 CRT 监控区主题名
  const nameEl = document.getElementById('crt-theme');
  if (nameEl) nameEl.textContent = THEME_NAMES[theme] || theme;
  // ★ 刷新 Canvas 颜色缓存（否则切主题后战斗画面不变色）
  refreshColorCache();
}

/** 初始化主题切换按钮 */
export function initThemeSwitcher() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;

  // 应用检测到的主题（已在模块顶层 detectCurrentThemeIdx 确定）
  applyTheme(THEMES[_currentThemeIdx]);

  btn.addEventListener('click', () => {
    const container = document.querySelector('.crt-container');
    // 开机/关机过渡动画
    if (container) container.classList.add('switching');
    // 在 power-switch 动画中点切换主题
    setTimeout(() => {
      _currentThemeIdx = (_currentThemeIdx + 1) % THEMES.length;
      applyTheme(THEMES[_currentThemeIdx]);
    }, 160);
    setTimeout(() => {
      if (container) container.classList.remove('switching');
    }, 400);
    // 按钮闪光反馈
    btn.style.boxShadow = '0 0 20px currentColor';
    setTimeout(() => { btn.style.boxShadow = ''; }, 300);
  });
}

/** 获取当前主题名（供外部调用） */
export function getCurrentThemeName() {
  return THEME_NAMES[THEMES[_currentThemeIdx]] || '';
}
