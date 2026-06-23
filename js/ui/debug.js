// js/ui/debug.js
// 调试面板 — 按 ~ 键开关（左上角浮动面板）
// v1.1 — 刷怪、跳层、解锁图鉴、加装备

import { state } from '../core/state.js';
import { recalcStats } from '../systems/stats.js';
import { world } from '../core/world.js';
import {
  startWave, onEnemyDeath,
  makeEnemyById,
} from '../systems/encounter.js';
import { CONCEPTS, findConcept } from '../data/concepts.js';
import {
  ENEMY_TEMPLATES, ELITE_TEMPLATES, BOSS_TEMPLATES,
} from '../data/enemies.js';
import { generateItem } from '../systems/loot.js';
import { ITEM_TEMPLATES } from '../data/items.js';
import { getFinalStats } from '../systems/effects.js';
import { log } from '../ui/hud.js';
import { expToNext, INVENTORY_MAX, LEVEL_UP, RARITIES } from '../data/constants.js';
import { getAffixPoolForRarity, rollAffix } from '../data/affixes.js';

// ── 状态 ─────────────────────────────────────────────────────
let panelEl = null;
let visible = false;

// 将 finalStats 同步到 player 的活跃属性字段
function _syncFromFinal() {
  const s = getFinalStats();
  const p = state.player;
  p.maxHp = Math.floor(s.maxHp);
  p.maxMp = Math.floor(s.maxMp);
  p.atk = s.atk;
  p.def = s.def;
  p.aspd = s.aspd;
  p.crit = s.crit;
  p.critDmg = s.critDmg;
  p.dodge = s.dodge;
  p.block = s.block;
  p.luck = s.luck;
  p.itemFind = s.itemFind;
  p.rarityFind = s.rarityFind;
  p.expGain = s.expGain;
  p.goldGain = s.goldGain;
  p.lifesteal = s.lifesteal;
  p.cooldownRed = s.cooldownRed;
}

// ── 初始化 ───────────────────────────────────────────────────
export function initDebugUI() {
  buildPanel();
  panelEl = document.getElementById('debug-panel');
  if (!panelEl) return;

  // ~ 键开关
  document.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      togglePanel();
    }
  });

  console.log('%c🛠 调试面板已加载 — 按 ~ 键打开', 'color:#0f0;font-weight:bold;');
}

// ── 构建面板 DOM ─────────────────────────────────────────────
function buildPanel() {
  if (document.getElementById('debug-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.innerHTML = `
    <div class="debug-titlebar">
      <span>🛠 调试终端</span>
      <button id="debug-close">[×]</button>
    </div>
    <div class="debug-body">

      <div class="debug-section">
        <div class="debug-section-title">⚡ 快捷操作</div>
        <div class="debug-row">
          <button class="debug-btn" data-action="heal">💚 回满HP</button>
          <button class="debug-btn" data-action="addGold">💰 +500金</button>
          <button class="debug-btn" data-action="addExp">⭐ +100EXP</button>
        </div>
        <div class="debug-row">
          <button class="debug-btn" data-action="levelUp">⬆️ 升1级</button>
          <button class="debug-btn" data-action="addPoints">🎯 +10天赋点</button>
          <button class="debug-btn" data-action="resetPoints">♻️ 重置天赋</button>
        </div>
        <div class="debug-row">
          <button class="debug-btn" data-action="clearEnemies">🧹 清屏怪物</button>
          <button class="debug-btn" data-action="unlockAllCodex">📖 解锁全图鉴</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">🎯 跳层</div>
        <div class="debug-row">
          <input type="number" id="debug-stage-input" value="1" min="1" max="999"
                 style="width:80px;background:#111;color:#0f0;border:1px solid #333;padding:4px;font-family:monospace;">
          <button class="debug-btn" data-action="gotoStage">跳转</button>
          <button class="debug-btn" data-action="nextBoss">下一个Boss层</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">👾 刷怪物</div>
        <div class="debug-row">
          <select id="debug-enemy-select"
                  style="flex:1;background:#111;color:#0f0;border:1px solid #333;padding:4px;font-size:12px;"></select>
          <button class="debug-btn" data-action="spawnEnemy">刷1只</button>
        </div>
        <div class="debug-row">
          <button class="debug-btn" data-action="spawnWave">刷一波(5只)</button>
          <button class="debug-btn" data-action="spawnBoss">刷当前层Boss</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">🎒 加装备</div>
        <div class="debug-row">
          <select id="debug-rarity-select"
                  style="background:#111;color:#0f0;border:1px solid #333;padding:4px;font-size:12px;">
            <option value="0" style="color:#888">现象的 (普通)</option>
            <option value="1" style="color:#44aaff">概念的 (魔法)</option>
            <option value="2" style="color:#ffcc44">超验的 (稀有)</option>
            <option value="3" style="color:#cc44ff">存在的 (史诗)</option>
            <option value="4" style="color:#ff8844">不可言说的 (传说)</option>
            <option value="5" style="color:#ff4444">终极命题的 (神话)</option>
          </select>
          <button class="debug-btn" data-action="addItem">加1件</button>
          <button class="debug-btn" data-action="addLegendary">加传说</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">📊 实时状态</div>
        <div id="debug-status" style="font-size:11px;line-height:1.6;color:#888;font-family:monospace;"></div>
      </div>

    </div>
  `;

  document.getElementById('app').appendChild(panel);

  // 填充怪物下拉选项（动态，因为依赖 import）
  populateEnemySelect();

  // 关闭按钮
  document.getElementById('debug-close').onclick = togglePanel;

  // 按钮事件委托
  panel.addEventListener('click', handleDebugClick);

  // 初始隐藏
  panel.style.display = 'none';
}

// ── 填充怪物下拉 ─────────────────────────────────────────────
function populateEnemySelect() {
  const select = document.getElementById('debug-enemy-select');
  if (!select) return;

  const makeOpt = (tmpl) => `<option value="${tmpl.id}">${tmpl.symbol} ${tmpl.name}</option>`;

  select.innerHTML =
    `<optgroup label="普通怪">${ENEMY_TEMPLATES.map(makeOpt).join('')}</optgroup>` +
    `<optgroup label="精英">${ELITE_TEMPLATES.map(makeOpt).join('')}</optgroup>` +
    `<optgroup label="Boss">${BOSS_TEMPLATES.map(makeOpt).join('')}</optgroup>`;
}

// ── 开关面板 ─────────────────────────────────────────────────
function togglePanel() {
  if (!panelEl) return;
  visible = !visible;
  panelEl.style.display = visible ? 'flex' : 'none';
  if (visible) updateStatus();
}

// ── 按钮点击处理 ─────────────────────────────────────────────
function handleDebugClick(e) {
  const btn = e.target.closest('.debug-btn');
  if (!btn) return;
  const action = btn.dataset.action;
  if (!action) return;

  console.log(`[调试] 执行: ${action}`);
  executeAction(action);
  updateStatus();
}

function executeAction(action) {
  try {
    switch (action) {

      case 'heal':
        state.player.hp = state.player.maxHp;
        log('[调试] HP回满');
        break;

      case 'addGold':
        state.player.gold = (state.player.gold || 0) + 500;
        log('[调试] +500 金币');
        break;

      case 'addExp': {
        state.player.exp += 100;
        while (state.player.exp >= state.player.expToNext) {
          state.player.exp -= state.player.expToNext;
          state.player.level += 1;
          state.player.baseMaxHp += LEVEL_UP.maxHp;
          state.player.baseMaxMp += LEVEL_UP.maxMp;
          state.player.baseAtk += LEVEL_UP.atk;
          state.player.baseDef += LEVEL_UP.def;
          state.player.expToNext = expToNext(state.player.level);
          recalcStats();
          _syncFromFinal();
          state.player.hp = state.player.maxHp;
          log(`[调试] 升到 Lv${state.player.level} — ATK:${Math.floor(state.player.atk)} DEF:${Math.floor(state.player.def)}`);
        }
        if (state.player.exp < state.player.expToNext) {
          log(`[调试] +100 EXP (${Math.floor(state.player.exp)}/${state.player.expToNext})`);
        }
        break;
      }

      case 'levelUp': {
        state.player.level += 1;
        state.player.baseMaxHp += LEVEL_UP.maxHp;
        state.player.baseMaxMp += LEVEL_UP.maxMp;
        state.player.baseAtk += LEVEL_UP.atk;
        state.player.baseDef += LEVEL_UP.def;
        state.player.expToNext = expToNext(state.player.level);
        recalcStats();
        _syncFromFinal();
        state.player.hp = state.player.maxHp;
        log(`[调试] 升到 Lv${state.player.level} — ATK:${Math.floor(state.player.atk)} DEF:${Math.floor(state.player.def)} HP:${state.player.maxHp}`);
        break;
      }

      case 'addPoints':
        state.player.statPoints = (state.player.statPoints || 0) + 10;
        log(`[调试] +10 天赋点 (总计 ${state.player.statPoints})`);
        break;

      case 'resetPoints': {
        state.player.statPoints = 0;
        state.player.customStats = { maxHp:0, maxMp:0, atk:0, def:0, crit:0, aspd:0, dodge:0, luck:0 };
        recalcStats();
        _syncFromFinal();
        log('[调试] 天赋点已重置');
        break;
      }

      case 'clearEnemies':
        if (world.enemies) {
          const count = world.enemies.filter(e => !e.dead).length;
          world.enemies = world.enemies.filter(e => e.dead);
          world.waveEnemiesLeft = 0;
          log(`[调试] 清除了 ${count} 只怪物`);
        }
        break;

      case 'unlockAllCodex': {
        let newCount = 0;
        for (const c of CONCEPTS) {
          if (!state.unlockedCodex.includes(c.id)) {
            state.unlockedCodex.push(c.id);
            newCount++;
          }
        }
        log(`[调试] 解锁了 ${newCount} 条新概念，总计 ${state.unlockedCodex.length}/${CONCEPTS.length}`);
        break;
      }

      case 'gotoStage': {
        const input = document.getElementById('debug-stage-input');
        const target = parseInt(input.value) || 1;
        state.stage = Math.max(1, target);
        recalcStats();
        log(`[调试] 跳转到 STAGE ${state.stage}`);
        break;
      }

      case 'nextBoss': {
        const next = Math.ceil((state.stage + 1) / 10) * 10;
        state.stage = next;
        recalcStats();
        log(`[调试] 跳转到 Boss 层 STAGE ${state.stage}`);
        break;
      }

      case 'spawnEnemy': {
        const select = document.getElementById('debug-enemy-select');
        const id = select.value;
        if (!id) { log('[调试] ⚠️ 请先选择怪物'); return; }
        const enemy = makeEnemyById(id);
        if (enemy) {
          world.enemies.push(enemy);
          world.waveEnemiesLeft += 1;
          world.waveState = 'combat';
          log(`[调试] 刷出: ${enemy.name} (${enemy.type})`);
        } else {
          log(`[调试] ⚠️ 找不到怪物模板: ${id}`);
        }
        break;
      }

      case 'spawnWave':
        if (world.waveState === 'idle' || world.waveState === 'rest') {
          startWave();
          log('[调试] 开始新的一波怪物');
        } else {
          log('[调试] ⚠️ 当前正在战斗中，请先清屏');
        }
        break;

      case 'spawnBoss': {
        // 找当前层合适的 Boss
        const bossTmpl = BOSS_TEMPLATES.find(b => {
          const [min, max] = b.stageRange || [1, 999];
          return state.stage >= min && state.stage <= max;
        }) || BOSS_TEMPLATES[0];
        const enemy = makeEnemyById(bossTmpl.id);
        if (enemy) {
          world.enemies.push(enemy);
          world.waveEnemiesLeft += 1;
          world.waveState = 'combat';
          log(`[调试] 刷出 Boss: ${enemy.name}`);
        }
        break;
      }

      case 'addItem': {
        const raritySelect = document.getElementById('debug-rarity-select');
        const item = generateItem(state.stage, 'normal');
        if (item) {
          const rarities = ['common', 'magic', 'rare', 'epic', 'legendary', 'mythic'];
          const newRarity = rarities[parseInt(raritySelect.value)] || 'common';
          const rarityDef = RARITIES[newRarity];
          item.rarity = newRarity;
          item.color = rarityDef.color;
          // 重新按稀有度缩放属性
          const tmpl = ITEM_TEMPLATES.find(t => t.templateId === item.templateId || t.name === item.name);
          if (tmpl && tmpl.baseStats) {
            const statScale = rarityDef.statMul * (1 + (state.stage - 1) * 0.05);
            item.stats = {};
            for (const [k, v] of Object.entries(tmpl.baseStats)) {
              item.stats[k] = parseFloat((v * statScale).toFixed(3));
            }
          }
          // 重新生成词缀
          const affixPool = getAffixPoolForRarity(newRarity);
          item.affixes = [];
          for (let i = 0; i < rarityDef.affixCount; i++) {
            item.affixes.push(rollAffix(affixPool, state.stage));
          }
          state.inventory.push(item);
          log(`[调试] 获得: ${item.name} [${rarityDef.label}]`);
        }
        break;
      }

      case 'addLegendary': {
        const item = generateItem(state.stage, 'boss');
        if (item) {
          const rarityDef = RARITIES.legendary;
          item.rarity = 'legendary';
          item.color = rarityDef.color;
          const tmpl = ITEM_TEMPLATES.find(t => t.templateId === item.templateId || t.name === item.name);
          if (tmpl && tmpl.baseStats) {
            const statScale = rarityDef.statMul * (1 + (state.stage - 1) * 0.05);
            item.stats = {};
            for (const [k, v] of Object.entries(tmpl.baseStats)) {
              item.stats[k] = parseFloat((v * statScale).toFixed(3));
            }
          }
          const affixPool = getAffixPoolForRarity('legendary');
          item.affixes = [];
          for (let i = 0; i < rarityDef.affixCount; i++) {
            item.affixes.push(rollAffix(affixPool, state.stage));
          }
          state.inventory.push(item);
          log(`[调试] 获得传说: ${item.name} [${rarityDef.label}]`);
        }
        break;
      }

      default:
        log(`[调试] 未知操作: ${action}`);
    }
  } catch (err) {
    console.error('[调试] 执行失败:', err);
    log(`[调试] ❌ 错误: ${err.message}`);
  }
}

// ── 更新状态显示 ─────────────────────────────────────────────
function updateStatus() {
  const el = document.getElementById('debug-status');
  if (!el) return;

  const stats = getFinalStats ? getFinalStats() : {};
  const aliveEnemies = world.enemies ? world.enemies.filter(e => !e.dead).length : 0;
  el.innerHTML = `
    Stage: ${state.stage}<br>
    LV: ${state.player.level}<br>
    HP: ${Math.floor(state.player.hp)}/${state.player.maxHp}<br>
    ATK: ${Math.floor(stats.atk || 0)} DEF: ${Math.floor(stats.def || 0)}<br>
    Gold: ${state.player.gold || 0}<br>
    怪物: ${aliveEnemies} | 图鉴: ${state.unlockedCodex.length}/${CONCEPTS.length}<br>
    背包: ${state.inventory ? state.inventory.length : 0}/${INVENTORY_MAX}
  `;
}

// ── 对外暴露 ─────────────────────────────────────────────────
export function updateDebugStatus() {
  if (visible) updateStatus();
}
