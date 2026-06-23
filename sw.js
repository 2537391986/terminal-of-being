// sw.js — Service Worker (PWA 标准升级循环 v0.8.1)
// 修复：原来逻辑在版本不一致时直接 self-destruct，导致每次部署都清空离线缓存。
// 现在改为：新 SW 安装时先缓存资源 → activate 时清除旧版本缓存 → skipWaiting 接管。

const CACHE_VERSION = 'tob-v0.8.3';
const CACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/main.js',
  './js/core/state.js',
  './js/core/save.js',
  './js/core/world.js',
  './js/core/renderer.js',
  './js/systems/combat.js',
  './js/systems/encounter.js',
  './js/systems/effects.js',
  './js/systems/equipment.js',
  './js/systems/loot.js',
  './js/systems/stats.js',
  './js/data/affixes.js',
  './js/data/concepts.js',
  './js/data/constants.js',
  './js/data/enemies.js',
  './js/data/items.js',
  './js/data/weaponTypes.js',
  './js/ui/codex.js',
  './js/ui/debug.js',
  './js/ui/hud.js',
  './js/ui/inventory.js',
  './js/ui/statPoints.js',
  './js/utils/html.js',
];

// ── 安装：预缓存当前版本所有资源 ──
self.addEventListener('install', (event) => {
  console.log(`[SW] 安装 ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CACHE_ASSETS))
      .then(() => {
        console.log(`[SW] 预缓存完成`);
        // 强制跳过等待，立即激活（不等待旧页面关闭）
        return self.skipWaiting();
      })
  );
});

// ── 激活：清除旧版本缓存，接管所有客户端 ──
self.addEventListener('activate', (event) => {
  console.log(`[SW] 激活 ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then(keys => {
      const deleteOld = keys
        .filter(k => k !== CACHE_VERSION)
        .map(k => {
          console.log(`[SW] 删除旧缓存: ${k}`);
          return caches.delete(k);
        });
      return Promise.all(deleteOld);
    }).then(() => {
      // 接管所有已打开的客户端，无需刷新即生效
      return self.clients.claim();
    }).then(() => {
      // 通知所有客户端：SW 已更新，可选择提示用户刷新
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// ── Fetch：Cache-First 策略（离线优先，命中缓存则直接返回） ──
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求；POST/PUT 等直接通过
  if (event.request.method !== 'GET') return;

  // chrome-extension / data 等非 http 请求直接忽略
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      // 缓存未命中：回退到网络，并将成功响应写入缓存
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, toCache));
        return response;
      });
    }).catch(() => {
      // 完全离线且缓存也没有：返回 index.html 作为 fallback（SPA 模式）
      return caches.match('./index.html');
    })
  );
});
