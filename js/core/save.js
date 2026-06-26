// js/core/save.js
// localStorage 存档读写 + 版本迁移 + schema 校验 + 只读保护
// v3.0 — 字段级 migrateData 平滑升级 + 只读模式 (no more delete-on-version-mismatch)

import { initialState, state, mergeState } from './state.js';

export const SAVE_KEY = 'terminal_of_being_save_v3';
export const SAVE_VERSION = 3;

// ============================================================
// 只读保护
// ============================================================
let _readOnly = false;

export function isReadOnly() { return _readOnly; }

// ============================================================
// 版本迁移表
// ============================================================
const MIGRATIONS = {
  /**
   * v1 → v2: 补全缺失字段
   */
  1: (data) => {
    const migrated = { ...data };
    const p = migrated.player || {};
    if (p.statPoints === undefined) p.statPoints = 0;
    const csDefaults = { maxHp: 0, maxMp: 0, atk: 0, def: 0, crit: 0, aspd: 0, dodge: 0, luck: 0 };
    p.customStats = { ...csDefaults, ...(p.customStats || {}) };
    if (p.munchhausenStack === undefined) p.munchhausenStack = 0;
    if (!migrated.settings) migrated.settings = { usePlainTerms: false };
    migrated.player = p;
    migrated.version = 2;
    return migrated;
  },
  /**
   * v2 → v3: 后续字段补全（为未来预留）
   */
  2: (data) => {
    const migrated = { ...data };
    if (!migrated.settings) migrated.settings = {};
    if (migrated.settings.usePlainTerms === undefined) migrated.settings.usePlainTerms = false;
    migrated.version = 3;
    return migrated;
  },
};

/**
 * 字段级迁移：从 fromVersion 逐级迁移到 toVersion
 * @param {Object} data
 * @param {number} fromVersion
 * @param {number} toVersion
 * @returns {Object} 迁移后的数据
 */
function migrateData(data, fromVersion, toVersion) {
  let current = { ...data };
  for (let v = fromVersion; v < toVersion; v++) {
    if (MIGRATIONS[v]) {
      current = MIGRATIONS[v](current);
    }
  }
  current.version = toVersion;
  return current;
}

// ============================================================
// 存档校验
// ============================================================
function validateSaveData(data) {
  if (!data || typeof data !== 'object') return null;
  if (!data.player || typeof data.player !== 'object') return null;

  const defaults = initialState();

  const player = { ...defaults.player, ...data.player };
  player.level = Number(player.level) || 1;
  player.exp = Number(player.exp) || 0;
  player.expToNext = Number(player.expToNext) || 20;
  player.gold = Number(player.gold) || 0;
  player.hp = Number(player.hp) || player.maxHp || 100;
  player.mp = Number(player.mp) || 0;
  player.maxHp = Number(player.maxHp) || 100;
  player.maxMp = Number(player.maxMp) || 30;
  player.statPoints = Number(player.statPoints) || 0;
  const csDefaults = { maxHp: 0, maxMp: 0, atk: 0, def: 0, crit: 0, aspd: 0, dodge: 0, luck: 0 };
  player.customStats = { ...csDefaults, ...(player.customStats || {}) };

  data.player = player;
  data.stage = Number(data.stage) || 1;
  data.bestStage = Number(data.bestStage) || 1;
  data.inventory = Array.isArray(data.inventory) ? data.inventory : [];
  data.equipment = { ...defaults.equipment, ...(data.equipment || {}) };
  if (!Array.isArray(data.equipment.ring)) data.equipment.ring = [null, null];
  data.unlockedCodex = Array.isArray(data.unlockedCodex) ? data.unlockedCodex : [];
  data.logs = Array.isArray(data.logs) ? data.logs.slice(-80) : [];
  data.settings = { ...defaults.settings, ...(data.settings || {}) };

  return data;
}

// ============================================================
// 持久化
// ============================================================
export function saveGame() {
  if (_readOnly) return false;
  try {
    const data = { version: SAVE_VERSION, ...state, savedAt: Date.now() };
    if (data.player) {
      const p = { ...data.player };
      delete p.finalStats;
      delete p.killAtkStack;
      data.player = p;
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('[Save] 写入失败:', e);
    _readOnly = true;
    // 通知 HUD（log 函数由 hud.js 导出，这里用 state.logs 直接推进备选）
    if (state.logs) {
      state.logs.push({ t: Date.now(), msg: '[系统] 存在锚定失败 — 只读模式启动', type: 'err' });
      state._logVersion = (state._logVersion || 0) + 1;
    }
    return false;
  }
}

// ============================================================
// 加载
// ============================================================
export function loadGame() {
  try {
    // 先尝试 v3 key，再降级到 v1 key
    let raw = localStorage.getItem(SAVE_KEY);

    // 兼容旧 key：v1 和 v2
    if (!raw) {
      const legacyKeys = ['terminal_of_being_save_v2', 'terminal_of_being_save_v1'];
      for (const lk of legacyKeys) {
        raw = localStorage.getItem(lk);
        if (raw) break;
      }
    }

    if (!raw) return false;

    const data = JSON.parse(raw);
    const dataVersion = data.version || 1;

    // 版本低于当前：平滑迁移
    if (dataVersion < SAVE_VERSION) {
      console.log(`[Save] 存档迁移: v${dataVersion} → v${SAVE_VERSION}`);
      const migrated = migrateData(data, dataVersion, SAVE_VERSION);
      const validated = validateSaveData(migrated);
      if (!validated) {
        console.warn('[Save] 迁移后数据异常，尝试原始数据加载');
        const fallback = validateSaveData(data);
        if (!fallback) {
          console.warn('[Save] 数据不可用，清空');
          localStorage.removeItem(SAVE_KEY);
          return false;
        }
        mergeState(fallback);
        return true;
      }
      mergeState(validated);
      // 用新 key 保存迁移后的数据
      saveGame();
      return true;
    }

    // 版本高于当前：警告但尝试加载
    if (dataVersion > SAVE_VERSION) {
      console.warn(`[Save] 存档来自未来版本 v${dataVersion}，当前 v${SAVE_VERSION}，尝试加载`);
    }

    const validated = validateSaveData(data);
    if (!validated) {
      console.warn('[Save] 数据结构异常，清空');
      localStorage.removeItem(SAVE_KEY);
      return false;
    }
    mergeState(validated);
    return true;
  } catch (e) {
    console.error('[Save] 读档失败:', e);
    _readOnly = true;
    return false;
  }
}

// ============================================================
// 清除
// ============================================================
export function clearSave() {
  if (_readOnly) {
    if (state.logs) {
      state.logs.push({ t: Date.now(), msg: '[系统] 只读模式 — 清除操作被阻止', type: 'err' });
      state._logVersion = (state._logVersion || 0) + 1;
    }
    return;
  }
  // 清除所有可能的 key
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem('terminal_of_being_save_v2');
  localStorage.removeItem('terminal_of_being_save_v1');
  mergeState(initialState());
}
