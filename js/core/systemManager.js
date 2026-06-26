// js/core/systemManager.js
// v1.0 — 统一事件生命周期管理器
// 所有 addEventListener / setInterval 走此代理，确保 init 前强制 cleanup()

/** @type {Map<EventTarget|Window|Document, Map<string, {handler:Function, opts:Object}>>} */
let _listeners = null;
/** @type {Set<number>} */
let _intervals = null;
let _ready = false;

/**
 * 注册事件监听器（记录到注册表，不立即绑定）
 * @param {EventTarget|Window|Document} target
 * @param {string} type
 * @param {Function} handler
 * @param {Object|boolean} [opts]
 */
export function on(target, type, handler, opts) {
  if (!_listeners) _listeners = new Map();
  if (!_listeners.has(target)) _listeners.set(target, new Map());
  const typeMap = _listeners.get(target);
  typeMap.set(type, { handler, opts: opts || false });
}

/**
 * 注册 setInterval（记录 handle，init() 时启动）
 * @param {Function} fn
 * @param {number} ms
 * @returns {number} 返回监听 ID（用于外部标记，实际清理由 cleanup 统一管理）
 */
export function setInterval(fn, ms) {
  const id = window.setInterval(fn, ms);
  if (!_intervals) _intervals = new Set();
  _intervals.add(id);
  return id;
}

/**
 * 绑定所有已注册的监听器
 * 必须在 cleanup() 之后调用，否则抛错
 */
export function init() {
  if (_ready) {
    console.warn('[SystemManager] Already initialized, skipping');
    return;
  }
  if (!_listeners) {
    _ready = true;
    return;
  }
  for (const [target, typeMap] of _listeners) {
    for (const [type, { handler, opts }] of typeMap) {
      target.addEventListener(type, handler, opts);
    }
  }
  _ready = true;
}

/**
 * 移除所有监听器、清除所有 interval
 * 调用后 _ready = false，可安全重新 init()
 */
export function cleanup() {
  // 清除事件监听
  if (_listeners) {
    for (const [target, typeMap] of _listeners) {
      for (const [type, { handler, opts }] of typeMap) {
        target.removeEventListener(type, handler, opts);
      }
    }
    _listeners.clear();
  }

  // 清除 intervals
  if (_intervals) {
    for (const id of _intervals) {
      window.clearInterval(id);
    }
    _intervals.clear();
  }

  _ready = false;
}

/**
 * 查询系统是否已初始化
 */
export function isReady() { return _ready; }
