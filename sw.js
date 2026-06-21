// sw.js — 自毁程序
// 清除所有缓存并注销自身

const SUICIDE = true;

self.addEventListener('install', () => {
  console.log('[SW自毁] 安装中...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW自毁] 激活，清除所有缓存并注销...');
  event.waitUntil(
    (async () => {
      // 1. 删除所有缓存
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      console.log('[SW自毁] 已清除缓存:', keys);

      // 2. 注销自身
      try {
        await self.registration.unregister();
        console.log('[SW自毁] 已注销 Service Worker');
      } catch (e) {
        console.warn('[SW自毁] 注销失败:', e);
      }

      // 3. 刷新所有打开的页面
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ type: 'SW_SUICIDE' });
        client.navigate(client.url);
      });
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // 不再缓存，全部直通网络
  event.respondWith(fetch(event.request));
});
