// js/core/save.js
// localStorage 存档读写 + 版本迁移 + schema 校验
// v8.2 — 加载时校验数据结构，缺字段用 initialState() 补全

import { initialState, state, mergeState } from './state.js';

export const SAVE_KEY = 'terminal_of_being_save_v1';
export const SAVE_VERSION = 1;

export function saveGame() {
  try {
    const data = { version: SAVE_VERSION, ...state, savedAt: Date.now() };
    // 剥离运行时计算字段(不应持久化)
    if (data.player) {
      const p = { ...data.player };
      delete p.finalStats;
      delete p.killAtkStack;
      data.player = p;
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('存档失败:', e);
    return false;
  }
}

/**
 * 校验存档数据结构，缺字段用默认值补全
 * @param {Object} data - 从 localStorage 解析的数据
 * @returns {Object|null} 校验通过的数据，或 null 表示数据不可用
 */
function validateSaveData(data) {
  if (!data || typeof data !== 'object') return null;

  // 必须有 player 对象
  if (!data.player || typeof data.player !== 'object') return null;

  const defaults = initialState();

  // 合并 player — 缺字段用默认值补
  const player = { ...defaults.player, ...data.player };
  // 确保数值类型正确
  player.level = Number(player.level) || 1;
  player.exp = Number(player.exp) || 0;
  player.expToNext = Number(player.expToNext) || 20;
  player.gold = Number(player.gold) || 0;
  player.hp = Number(player.hp) || player.maxHp || 100;
  player.mp = Number(player.mp) || 0;
  player.maxHp = Number(player.maxHp) || 100;
  player.maxMp = Number(player.maxMp) || 30;
  // 合并天赋点
  player.statPoints = Number(player.statPoints) || 0;
  // 合并自定义属性 — 缺字段补0
  const csDefaults = { maxHp:0, maxMp:0, atk:0, def:0, crit:0, aspd:0, dodge:0, luck:0 };
  player.customStats = { ...csDefaults, ...(player.customStats || {}) };

  data.player = player;

  // 合并进度
  data.stage = Number(data.stage) || 1;
  data.bestStage = Number(data.bestStage) || 1;

  // 合并背包 — 必须是数组
  data.inventory = Array.isArray(data.inventory) ? data.inventory : [];

  // 合并装备 — 缺槽位用默认值
  data.equipment = { ...defaults.equipment, ...(data.equipment || {}) };
  // 确保 ring 是双槽
  if (!Array.isArray(data.equipment.ring)) {
    data.equipment.ring = [null, null];
  }

  // 合并图鉴
  data.unlockedCodex = Array.isArray(data.unlockedCodex) ? data.unlockedCodex : [];

  // 合并日志
  data.logs = Array.isArray(data.logs) ? data.logs.slice(-80) : [];

  // 合并设置
  data.settings = { ...defaults.settings, ...(data.settings || {}) };

  return data;
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
    // schema 校验
    const validated = validateSaveData(data);
    if (!validated) {
      console.warn('存档数据结构异常,清空');
      localStorage.removeItem(SAVE_KEY);
      return false;
    }
    mergeState(validated);
    return true;
  } catch (e) {
    console.error('读档失败:', e);
    return false;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
  mergeState(initialState());
}
