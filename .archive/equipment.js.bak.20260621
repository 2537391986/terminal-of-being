// js/systems/equipment.js
// 装备穿戴/卸下/背包管理

import { state } from '../core/state.js';
import { INVENTORY_MAX, RARITIES } from '../data/constants.js';
import { recalcStats } from './stats.js';

// 穿戴装备(从背包移到装备栏)
export function equipItem(itemId) {
  const inv = state.inventory;
  const idx = inv.findIndex(i => i.id === itemId);
  if (idx === -1) return false;

  const item = inv[idx];
  const slot = item.slot;

  // 双戒指位
  if (slot === 'ring') {
    const rings = state.equipment.ring;
    if (!rings[0]) {
      rings[0] = item;
    } else if (!rings[1]) {
      rings[1] = item;
    } else {
      // 替换第一个戒指,旧的放回背包
      inv[idx] = rings[0];
      rings[0] = item;
      recalcStats();
      return true;
    }
    inv.splice(idx, 1);
    recalcStats();
    return true;
  }

  // 单槽位
  const current = state.equipment[slot];
  if (current) {
    // 交换:旧的放背包原位
    inv[idx] = current;
  } else {
    inv.splice(idx, 1);
  }
  state.equipment[slot] = item;
  recalcStats();
  return true;
}

// 卸下装备(从装备栏移到背包)
export function unequipItem(slot, ringIndex = 0) {
  if (slot === 'ring') {
    const rings = state.equipment.ring;
    if (!rings[ringIndex]) return false;
    if (state.inventory.length >= INVENTORY_MAX) return false;
    state.inventory.push(rings[ringIndex]);
    rings[ringIndex] = null;
    recalcStats();
    return true;
  }

  const item = state.equipment[slot];
  if (!item) return false;
  if (state.inventory.length >= INVENTORY_MAX) return false;
  state.inventory.push(item);
  state.equipment[slot] = null;
  recalcStats();
  return true;
}

// 丢弃装备(从背包移除)
export function discardItem(itemId) {
  const idx = state.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return false;
  state.inventory.splice(idx, 1);
  return true;
}

// 获取已装备物品列表
export function getEquippedItems() {
  const items = [];
  for (const [slot, val] of Object.entries(state.equipment)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item) items.push({ slot, item });
      }
    } else if (val) {
      items.push({ slot, item: val });
    }
  }
  return items;
}

// 检查背包是否已满
export function isInventoryFull() {
  return state.inventory.length >= INVENTORY_MAX;
}

// 获取稀有度排序权重(用于排序背包)
export function rarityWeight(rarity) {
  const order = { mythic: 6, legendary: 5, epic: 4, rare: 3, magic: 2, common: 1 };
  return order[rarity] || 0;
}

// 背包按稀有度排序
export function sortInventory() {
  state.inventory.sort((a, b) => rarityWeight(b.rarity) - rarityWeight(a.rarity));
}
