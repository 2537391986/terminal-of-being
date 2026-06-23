// js/main.js
// 入口 + 卷轴物理挂机主循环(MVP 阶段 0.5 — v4.0 卷轴版)

import { state, initialState, setState } from './core/state.js';
import { loadGame, saveGame } from './core/save.js';

// ============================================================
// 玩家位置常量(屏幕中央偏左)
// ============================================================
const PLAYER_X = 240;
const PLAYER_Y = 180;
const CANVAS_W = 800;
const CANVAS_H = 320;

// ============================================================
// 世界状态(敌人/投射物/粒子/飘字/掉落)
// ============================================================
const world = {
  enemies: [],
  projectiles: [],
  particles: [],
  damageTexts: [],
  drops: [],
  spawnTimer: 0,
  spawnInterval: 1500,
  // 计时器
  playerShootTimer: 0,
  playerMeleeTimer: 0,
  // Canvas
  canvas: null,
  ctx: null,
};

// ============================================================
// 初始化
// ============================================================
function init() {
  if (!loadGame()) {
    setState(initialState());
  }
  world.canvas = document.getElementById('combat-canvas');
  world.ctx = world.canvas.getContext('2d');
  world.canvas.width = CANVAS_W;
  world.canvas.height = CANVAS_H;
  bindUI();
  requestAnimationFrame(loop);
}

// ============================================================
// 敌人:从右外侧生成
// ============================================================
function spawnEnemy() {
  const stage = state.stage;
  const hp = 30 * Math.pow(stage, 1.35);
  const atk = 4 * Math.pow(stage, 1.18);
  const def = 1 + Math.pow(stage, 1.05);
  world.enemies.push({
    id: Date.now() + Math.random(),
    name: stage === 1 ? '我思故我在' : `敌-${stage}`,
    symbol: stage % 10 === 0 ? 'Ω' : stage % 5 === 0 ? 'S' : '?',
    type: stage % 10 === 0 ? 'boss' : stage % 5 === 0 ? 'elite' : 'normal',
    x: CANVAS_W + 30,
    y: 100 + Math.random() * 160,
    vx: 0,
    vy: 0,
    baseSpeed: 30 + stage * 1.5,    // 像素/秒
    hp, maxHp: hp,
    atk, def,
    dead: false,
  });
}

// ============================================================
// 击退 / 粒子 / 飘字 / 掉落
// ============================================================
function applyKnockback(target, source, force) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  target.vx += (dx / len) * force;
  target.vy += (dy / len) * force;
}

function spawnParticles(x, y, symbol, count) {
  for (let i = 0; i < count; i++) {
    world.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 150,
      vy: (Math.random() - 0.5) * 150 - 50,
      symbol,
      life: 400,
    });
  }
}

function spawnDamageText(x, y, value, isCrit) {
  world.damageTexts.push({
    x, y,
    value: Math.floor(value),
    isCrit,
    life: 800,
  });
}

function spawnDrop(x, y, item) {
  world.drops.push({
    x, y,
    vx: (Math.random() - 0.5) * 200,
    vy: -250,
    item,
    life: 30000,
    dead: false,
  });
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

// ============================================================
// 伤害(用 5.4 公式)
// ============================================================
function applyDamageToEnemy(enemy, rawDmg) {
  const dmg = Math.max(1, rawDmg - enemy.def * 0.5);
  // 暴击
  let finalDmg = dmg;
  let isCrit = false;
  if (Math.random() < state.player.crit) {
    finalDmg *= state.player.critDmg;
    isCrit = true;
  }
  // 闪避
  if (Math.random() < (state.player.dodge || 0)) {
    // 玩家是被打方
  }
  enemy.hp -= finalDmg;
  spawnDamageText(enemy.x, enemy.y - 14, finalDmg, isCrit);
  return finalDmg;
}

function applyDamageToPlayer(attacker) {
  const dmg = Math.max(1, attacker.atk - state.player.def * 0.5);
  state.player.hp -= dmg;
  spawnDamageText(PLAYER_X, PLAYER_Y - 14, dmg, false);
  // 玩家被击退(轻)
  applyKnockback({ x: PLAYER_X, y: PLAYER_Y, vx: 0, vy: 0 }, attacker, 30);
  return dmg;
}

function onEnemyDeath(enemy, byKnockback) {
  // 经验与金币
  const exp = (byKnockback ? 3 : 5) * Math.pow(state.stage, 1.15);
  const gold = (byKnockback ? 2 : 3) * Math.pow(state.stage, 1.10);
  state.player.exp += exp * (1 + state.player.expGain);
  state.player.gold += Math.floor(gold * (1 + state.player.goldGain));
  // 升级检查
  while (state.player.exp >= state.player.expToNext) {
    state.player.exp -= state.player.expToNext;
    state.player.level += 1;
    state.player.maxHp += 10;
    state.player.maxMp += 2;
    state.player.atk += 2;
    state.player.def += 1;
    state.player.expToNext = Math.floor(20 * Math.pow(state.player.level, 1.45));
    state.player.hp = state.player.maxHp;
    log(`[升级] Lv ${state.player.level}`);
  }
  // 推进 stage
  state.stage += 1;
  if (state.stage > state.bestStage) state.bestStage = state.stage;
  // 粒子
  spawnParticles(enemy.x, enemy.y, '✦', 8);
  // 日志
  log(`${byKnockback ? '[击退]' : '[击杀]'} ${enemy.name} +${exp.toFixed(0)}exp +${gold.toFixed(0)}金币`);
}

function onPlayerDeath() {
  log('[死亡] 回到起点');
  state.stage = Math.max(1, state.stage - 5);
  state.player.hp = state.player.maxHp;
  state.player.mp = state.player.maxMp;
  // 清空屏幕
  world.enemies = [];
  world.projectiles = [];
  world.particles = [];
  world.damageTexts = [];
  world.drops = [];
}

// ============================================================
// 主循环(v4.0 卷轴版)
// ============================================================
let lastTime = performance.now();

function loop(now) {
  const delta = Math.min(now - lastTime, 100);
  lastTime = now;

  // 1. 玩家射击(远程投射)
  world.playerShootTimer += delta;
  const shootInterval = 1000 / state.player.aspd;
  if (world.playerShootTimer >= shootInterval) {
    world.projectiles.push({
      x: PLAYER_X + 14,
      y: PLAYER_Y,
      vx: 500,
      vy: 0,
      dmg: state.player.atk,
      dead: false,
    });
    world.playerShootTimer = 0;
  }

  // 2. 玩家近战(60px 圆周)
  world.playerMeleeTimer += delta;
  if (world.playerMeleeTimer >= 400) {
    for (const enemy of world.enemies) {
      const d = distance({ x: PLAYER_X, y: PLAYER_Y }, enemy);
      if (d < 60 && !enemy.dead) {
        applyDamageToEnemy(enemy, state.player.atk * 0.7);
        applyKnockback(enemy, { x: PLAYER_X, y: PLAYER_Y }, 80);
        spawnParticles(enemy.x, enemy.y, '*', 3);
        if (enemy.hp <= 0) {
          enemy.dead = true;
          onEnemyDeath(enemy, false);
        }
      }
    }
    world.playerMeleeTimer = 0;
  }

  // 3. 敌人刷新
  world.spawnTimer += delta;
  world.spawnInterval = Math.max(200, 1500 - state.stage * 20);
  if (world.spawnTimer >= world.spawnInterval) {
    spawnEnemy();
    world.spawnTimer = 0;
  }

  // 4. 推进敌人
  for (const enemy of world.enemies) {
    if (enemy.dead) continue;
    enemy.x -= enemy.baseSpeed * (delta / 1000);
    enemy.x += enemy.vx * (delta / 1000);
    enemy.y += enemy.vy * (delta / 1000);
    enemy.vx *= 0.88;
    enemy.vy *= 0.88;
    // 出左屏
    if (enemy.x < -30) {
      enemy.dead = true;
      onEnemyDeath(enemy, true);
      continue;
    }
    // 撞到玩家
    if (distance(enemy, { x: PLAYER_X, y: PLAYER_Y }) < 28) {
      applyDamageToPlayer(enemy);
      applyKnockback(enemy, { x: PLAYER_X, y: PLAYER_Y }, 200);
    }
  }

  // 5. 推进投射物
  for (const proj of world.projectiles) {
    if (proj.dead) continue;
    proj.x += proj.vx * (delta / 1000);
    proj.y += proj.vy * (delta / 1000);
    for (const enemy of world.enemies) {
      if (enemy.dead) continue;
      if (distance(proj, enemy) < 20) {
        applyDamageToEnemy(enemy, proj.dmg);
        applyKnockback(enemy, proj, 150);
        spawnParticles(proj.x, proj.y, '!', 5);
        proj.dead = true;
        if (enemy.hp <= 0) {
          enemy.dead = true;
          onEnemyDeath(enemy, false);
        }
        break;
      }
    }
    if (proj.x > CANVAS_W + 30) proj.dead = true;
  }

  // 6. 推进装备掉落(飞向玩家)
  for (const drop of world.drops) {
    if (drop.dead) continue;
    const dx = PLAYER_X - drop.x;
    const dy = PLAYER_Y - drop.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d > 0) {
      drop.x += (dx/d) * 250 * (delta / 1000);
      drop.y += (dy/d) * 250 * (delta / 1000);
    }
    drop.vy += 400 * (delta / 1000);   // 重力
    drop.y += drop.vy * (delta / 1000);
    if (d < 28) {
      state.inventory.push(drop.item);
      log(`[拾取] ${drop.item.name}`);
      drop.dead = true;
    }
    drop.life -= delta;
    if (drop.life <= 0) drop.dead = true;
  }

  // 7. 推进粒子和飘字
  for (const p of world.particles) {
    p.x += p.vx * (delta / 1000);
    p.y += p.vy * (delta / 1000);
    p.life -= delta;
  }
  for (const t of world.damageTexts) {
    t.y -= 40 * (delta / 1000);
    t.life -= delta;
  }

  // 8. 清理
  world.enemies     = world.enemies.filter(e => !e.dead);
  world.projectiles = world.projectiles.filter(p => !p.dead);
  world.particles   = world.particles.filter(p => p.life > 0);
  world.damageTexts = world.damageTexts.filter(t => t.life > 0);
  world.drops       = world.drops.filter(d => !d.dead);

  // 9. 玩家死亡
  if (state.player.hp <= 0) onPlayerDeath();

  // 10. 渲染
  render();
  updateHUD();

  requestAnimationFrame(loop);
}

// ============================================================
// 渲染(Canvas + DOM)
// ============================================================
function render() {
  const ctx = world.ctx;
  // 清空
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // 地面
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(0, 280);
  ctx.lineTo(CANVAS_W, 280);
  ctx.stroke();
  // 玩家
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 10;
  ctx.fillText('@', PLAYER_X - 12, PLAYER_Y + 12);
  ctx.shadowBlur = 0;
  // 敌人
  ctx.font = '24px monospace';
  for (const e of world.enemies) {
    if (e.dead) continue;
    ctx.fillStyle = e.type === 'boss' ? '#ff4444' : e.type === 'elite' ? '#ffaa00' : '#ffffff';
    ctx.fillText(e.symbol, e.x - 10, e.y + 8);
    // 血条
    const hpPct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = '#444';
    ctx.fillRect(e.x - 14, e.y - 14, 28, 4);
    ctx.fillStyle = e.type === 'boss' ? '#ff4444' : e.type === 'elite' ? '#ffaa00' : '#00ff88';
    ctx.fillRect(e.x - 14, e.y - 14, 28 * hpPct, 4);
  }
  // 投射物
  ctx.font = '20px monospace';
  ctx.fillStyle = '#00ff88';
  for (const p of world.projectiles) {
    if (p.dead) continue;
    ctx.fillText('*', p.x - 6, p.y + 6);
  }
  // 飘字
  ctx.font = 'bold 14px monospace';
  for (const t of world.damageTexts) {
    ctx.fillStyle = t.isCrit ? '#ffaa00' : '#ffffff';
    ctx.fillText(t.value.toString(), t.x - 8, t.y);
  }
  // 粒子
  ctx.font = '14px monospace';
  for (const p of world.particles) {
    const a = Math.max(0, p.life / 400);
    ctx.fillStyle = `rgba(255, 255, 200, ${a})`;
    ctx.fillText(p.symbol, p.x, p.y);
  }
  // 掉落
  for (const d of world.drops) {
    if (d.dead) continue;
    ctx.font = 'bold 18px monospace';
    const r = d.item.rarity;
    ctx.fillStyle = r === 'legendary' ? '#ff8844' : r === 'epic' ? '#cc44ff' : r === 'rare' ? '#ffcc44' : r === 'magic' ? '#44aaff' : '#888';
    ctx.fillText('◆', d.x - 6, d.y);
  }
}

function updateHUD() {
  document.getElementById('stage').textContent = state.stage;
  document.getElementById('level').textContent = state.player.level;
  document.getElementById('gold').textContent = state.player.gold;
  document.getElementById('exp').textContent = `${Math.floor(state.player.exp)} / ${state.player.expToNext}`;
  document.getElementById('player-hp').textContent = `${Math.max(0, Math.floor(state.player.hp))} / ${state.player.maxHp}`;
  document.getElementById('player-mp').textContent = `${state.player.mp} / ${state.player.maxMp}`;
  const pPct = Math.max(0, state.player.hp / state.player.maxHp) * 100;
  document.getElementById('player-hp-bar').style.width = pPct + '%';
  document.getElementById('enemy-count').textContent = world.enemies.length;
  // 日志
  const logBox = document.getElementById('log');
  logBox.innerHTML = state.logs.slice(-50)
    .map(l => `<div>[${new Date(l.t).toLocaleTimeString()}] ${l.msg}</div>`)
    .join('');
  logBox.scrollTop = logBox.scrollHeight;
}

// ============================================================
// 日志
// ============================================================
function log(msg) {
  state.logs.push({ t: Date.now(), msg });
  if (state.logs.length > 50) state.logs.shift();
}

// ============================================================
// UI 绑定
// ============================================================
function bindUI() {
  document.getElementById('btn-save').onclick = () => {
    saveGame();
    log('[系统] 已保存');
  };
  document.getElementById('btn-clear').onclick = () => {
    if (confirm('清空存档?')) {
      localStorage.removeItem('terminal_of_being_save_v1');
      location.reload();
    }
  };
  // 手动触发一次掉落(测试装备爆效果)
  document.getElementById('btn-test-drop').onclick = () => {
    spawnDrop(
      PLAYER_X + 100 + Math.random() * 200,
      PLAYER_Y - 50,
      {
        id: 'test_' + Date.now(),
        templateId: 'test',
        name: '测试偶因论之钥',
        rarity: 'rare',
        slot: 'weapon',
        level: 1,
        enhance: 0,
        concept: { term: '偶因论', summary: '测试装备' },
        baseStats: { atk: 10 },
        affixes: [],
        effects: [],
        flavorText: '测试用',
      }
    );
    log('[系统] 测试装备已爆,飞向你');
  };
  // 自动保存
  setInterval(saveGame, 10000);
}

// ============================================================
// 启动
// ============================================================
init();
