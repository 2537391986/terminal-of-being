// js/core/state.js
// 全局游戏状态(单一对象)。所有系统共享此状态。

import { DEFAULT_WEAPON } from '../data/weaponTypes.js';

export const initialState = () => ({
  // 玩家基础属性
  player: {
    level: 1,
    exp: 0,
    expToNext: 20,
    gold: 0,

    // 当前生命/法力
    hp: 100,
    mp: 30,

    // 基础属性(等级成长,装备从此叠加)
    baseMaxHp: 100,
    baseMaxMp: 30,
    baseAtk: 10,
    baseDef: 2,
    baseAspd: 1.0,
    baseCrit: 0.05,
    baseCritDmg: 1.5,

    // 最终属性(由 stats.js 计算,不参与存档但会重算)
    finalStats: null,

    // 局内效果状态(死亡重置)
    killAtkStack: 0,

    // 自由属性点
    statPoints: 0,
    customStats: {
      maxHp: 0, maxMp: 0, atk: 0, def: 0,
      crit: 0, aspd: 0, dodge: 0, luck: 0,
    },

    // 明希豪森困境之钥：每10层词缀效果+5%（死亡不重置，卸装重置）
    munchhausenStack: 0,

    // 旧字段兼容(部分系统直接读这些)
    maxHp: 100,
    maxMp: 30,
    atk: 10,
    def: 2,
    aspd: 1.0,
    crit: 0.05,
    critDmg: 1.5,
    dodge: 0,
    block: 0,
    luck: 0,
    itemFind: 0,
    rarityFind: 0,
    expGain: 0,
    goldGain: 0,
    lifesteal: 0,
    cooldownRed: 0,
  },

  // 进度
  stage: 1,
  bestStage: 1,

  // 背包与装备
  inventory: [],
  equipment: {
    weapon: { ...DEFAULT_WEAPON }, head: null, chest: null,
    gloves: null, boots: null,
    ring: [null, null],
    amulet: null, charm: null, core: null,
  },

  // 已解锁概念(图鉴)
  unlockedCodex: [],

  // 日志(最多 80 条)
  logs: [],

  // 设置
  settings: { soundOn: false, animationOn: true, usePlainTerms: false },

  // 上次保存时间戳
  savedAt: Date.now(),
});

// 全局 state 引用 — 不可变绑定，只能通过 mergeState 修改属性
export const state = initialState();

/**
 * 深度合并两个对象——不替换嵌套对象，只更新叶节点值。
 * 数组视为原子值，直接替换（不做合并）。
 * @param {Object} target - 被写入的目标对象（会被 mutate）
 * @param {Object} source - 来源补丁
 */
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      deepMerge(tv, sv);
    } else {
      target[key] = sv;
    }
  }
}

/**
 * 合并更新 state（深度合并，安全更新嵌套属性）。
 * 例：mergeState({ player: { hp: 50 } }) 只更新 hp，不抹掉 customStats/equipment。
 * @param {Object} partial - 要合并的部分状态（可嵌套）
 */
export const mergeState = (partial) => { deepMerge(state, partial); };
