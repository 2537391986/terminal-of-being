// js/core/save.js
// localStorage 存档读写 + 版本迁移
import { initialState, state, setState } from './state.js';

export const SAVE_KEY = 'terminal_of_being_save_v1';
export const SAVE_VERSION = 1;

export function saveGame() {
  try {
    const data = { version: SAVE_VERSION, ...state, savedAt: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('存档失败:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) {
      console.warn('存档版本不匹配,清空');
      localStorage.removeItem(SAVE_KEY);
      return false;
    }
    setState(data);
    return true;
  } catch (e) {
    console.error('读档失败:', e);
    return false;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
  setState(initialState());
}
