// js/ui/theme.js
// CRT 终端三套主题切换（paper / amber / mono）
// v1.0 — 2026-06-25

const THEMES = ['paper', 'amber', 'mono'];
const THEME_NAMES = {
  paper: 'PAPER-WHITE',
  amber: 'AMBER CRT',
  mono: 'MONO GLOW',
};

let _currentThemeIdx = 0;

/** 从 localStorage 读取已保存的主题 */
function loadSavedTheme() {
  try {
    const saved = localStorage.getItem('crt-theme');
    if (saved && THEMES.includes(saved)) {
      _currentThemeIdx = THEMES.indexOf(saved);
      return saved;
    }
  } catch (e) {}
  return null;
}

/** 应用主题到 DOM */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('crt-theme', theme); } catch (e) {}
  // 同步更新 CRT 监控区主题名
  const nameEl = document.getElementById('crt-theme');
  if (nameEl) nameEl.textContent = THEME_NAMES[theme] || theme;
}

/** 初始化主题切换按钮 */
export function initThemeSwitcher() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;

  // 应用已保存的主题（或默认 mono）
  const saved = loadSavedTheme();
  if (saved) {
    _currentThemeIdx = THEMES.indexOf(saved);
    applyTheme(saved);
  } else {
    applyTheme(THEMES[_currentThemeIdx]);
  }

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
