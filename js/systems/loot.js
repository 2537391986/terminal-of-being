// js/systems/loot.js
// 掉落判定 + 装备生成(按设计文档 6.4)

import { RARITIES, DROP_CHANCE } from '../data/constants.js';
import { ITEM_TEMPLATES, randomTemplate, getTemplatesForStage } from '../data/items.js';
import { getAffixPoolForRarity, rollAffix } from '../data/affixes.js';
import { state } from '../core/state.js';

// 判定是否掉落装备(itemFind 加成)
export function shouldDropLoot(enemyType, itemFind = 0) {
  const base = DROP_CHANCE[enemyType] || DROP_CHANCE.normal;
  const chance = base * (1 + itemFind);
  return Math.random() < chance;
}

// 掷稀有度(加权随机 + luck + rarityFind 加成)
export function rollRarity() {
  const fs = state.player.finalStats || state.player;
  const luck = (fs.luck || 0);
  const rarityFind = (fs.rarityFind || 0);
  const effectiveLuck = luck + rarityFind * 100;

  const entries = Object.entries(RARITIES);
  let totalWeight = 0;
  const weights = entries.map(([key, r]) => {
    let w = r.weight;
    // 只给 rare 及以上加权(luck 加成)
    if (w <= 80) {
      w *= (1 + effectiveLuck / 300);
    }
    totalWeight += w;
    return { key, w };
  });

  let roll = Math.random() * totalWeight;
  for (const { key, w } of weights) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return 'common';
}

// 稀有度排序(Tier)
const RARITY_TIER = ['common', 'magic', 'rare', 'epic', 'legendary', 'mythic'];

// 生成一件装备
export function generateItem(stage, enemyType = 'normal') {
  const rarityDefs = RARITIES;

  // 1. 根据敌人类型确定候选模板(按 stageRange 过滤 + rarity 上限)
  let rarityCap;
  switch (enemyType) {
    case 'boss':    rarityCap = 'legendary'; break;
    case 'elite':   rarityCap = 'epic'; break;
    default:        rarityCap = 'rare'; break;
  }
  let pool = ITEM_TEMPLATES.filter(t => stage >= t.stageRange[0] && stage <= t.stageRange[1]);
  if (pool.length === 0) return null; // 当前 stage 无可用模板,不掉落

  // 2. 加权随机选模板(dropWeight)
  const totalWeight = pool.reduce((s, t) => s + (t.dropWeight || 10), 0);
  let r = Math.random() * totalWeight;
  const tmpl = pool.find(t => { r -= (t.dropWeight || 10); return r <= 0; }) || pool[0];

  // 3. Roll 稀有度(Boss 保底 rare,精英保底 magic)
  let rarity = rollRarity();
  if (enemyType === 'boss' && RARITY_TIER.indexOf(rarity) < RARITY_TIER.indexOf('rare')) {
    rarity = 'rare';
  }
  if (enemyType === 'elite' && RARITY_TIER.indexOf(rarity) < RARITY_TIER.indexOf('magic')) {
    rarity = 'magic';
  }

  const rarityDef = rarityDefs[rarity];

  // 4. 生成词缀(数量 = rarityDef.affixCount)
  const affixPool = getAffixPoolForRarity(rarity);
  const affixes = [];
  for (let i = 0; i < rarityDef.affixCount; i++) {
    affixes.push(rollAffix(affixPool, stage));
  }

  // 5. 基础属性缩放: baseStats × statMul × (1 + (stage-1) * 0.05)
  const statScale = rarityDef.statMul * (1 + (stage - 1) * 0.05);
  const scaledStats = {};
  if (tmpl.baseStats) {
    for (const [k, v] of Object.entries(tmpl.baseStats)) {
      scaledStats[k] = parseFloat((v * statScale).toFixed(3));
    }
  }

  // 6. 组装
  const item = {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    templateId: tmpl.templateId || null,
    name: tmpl.name,
    rarity,
    slot: tmpl.slot,
    level: stage,
    color: rarityDef.color,
    stats: scaledStats,
    affixes,
    effect: tmpl.effects ? tmpl.effects[0] : null, // 本期只支持 1 个 effect
    effects: tmpl.effects || [],
    concept: tmpl.concept ? { ...tmpl.concept } : null,
    flavorText: tmpl.flavorText || '',
  };

  return item;
}

// ═══════════════════════════════════════════════════════════════
// 掉落文案池
// ═══════════════════════════════════════════════════════════════
// 设计原则：每条文案都是一个"存在论事件"的微型叙事。
// 掉落不应该读成"怪物掉了装备",而应该读成"世界发生了一次哲学事件"：
//   - "现象被捕获"：胡塞尔现象学——意识终于注意到了那个"一直在"的现象
//   - "存在发生偏移"：海德格尔——某个存在者的存在方式改变了位置
//   - "概念凝聚成形"：黑格尔——一个"自在的概念"终于"自为"了
//   - "物自体裂隙被观测"：康德——不可知的"物自体"出现了一次认识论裂缝
//   - "命题在此凝结"：逻辑实证主义——一个无意义的命题获得了句法上的存在
//   - "未命名的概念获得了形式"：分析哲学早期的"概念分析"——形式终于被赋予
// 6条文案池：在挂机刷宝的高频触发场景中，6条可以维持约20-30分钟的
// 新鲜感（按每30秒一次掉落计算）。
// ═══════════════════════════════════════════════════════════════
export function dropMessage(item) {
  const rarityLabel = RARITIES[item.rarity]?.label || item.rarity;
  const templates = [
    `现象被捕获：[${rarityLabel}] ${item.name}`,
    `存在发生偏移：[${rarityLabel}] ${item.name}`,
    `概念凝聚成形：[${rarityLabel}] ${item.name}`,
    `一次"物自体"的裂隙被观测到：[${rarityLabel}] ${item.name}`,
    `某个命题在此凝结：[${rarityLabel}] ${item.name}`,
    `未命名的概念获得了形式：[${rarityLabel}] ${item.name}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
