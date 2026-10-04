import { PopStateEventType, HashChangeEventType } from '../../src/history/history';
import { HistoryType } from '../../src/history/types';

export type HeavyHistoryWindow = Window & {
  __heavyHistory: {
    setPath: (pathname: string, search?: string, hash?: string) => void;
    /** 清除 history.state 中的 idx，模拟旧浏览器 popstate */
    stripStateIdx: () => void;
    /** 直接写入 history.state */
    setState: (state: Record<string, unknown>) => void;
    firePopState: () => void;
    fireHashChange: () => void;
  };
};

export type CreateHeavyHistoryWindowOptions = {
  pathname?: string;
  search?: string;
  hash?: string;
  hashMode?: boolean;
  /** 初始 history.state.idx */
  initialIdx?: number;
};

/**
 * 创建可精细控制 pathname/search/hash/state 与 popstate 的 mock window。
 * @param options 初始路径与 hash 模式选项
 * @returns 带 __heavyHistory 控制器的 mock Window
 */
export function createHeavyHistoryWindow(
  options: CreateHeavyHistoryWindowOptions = {},
): HeavyHistoryWindow {
  const {
    pathname: initialPathname = '/',
    search: initialSearch = '',
    hash: initialHash = '',
    hashMode = false,
    initialIdx = 0,
  } = options;

  let pathname = initialPathname;
  let search = initialSearch;
  let hash = hashMode && !initialHash ? `#${initialPathname}` : initialHash;
  let historyState: Record<string, unknown> = {
    idx: initialIdx,
    usr: null,
    key: 'default',
  };

  const listeners: Record<string, Function[]> = {};

  const location = {
    get pathname() { return pathname; },
    set pathname(v: string) { pathname = v; },
    get search() { return search; },
    set search(v: string) { search = v; },
    get hash() { return hash; },
    set hash(v: string) { hash = v; },
    get href() {
      return `http://localhost${pathname}${search}${hash}`;
    },
    assign: jest.fn(),
    replace: jest.fn(),
  };

  /**
   * 从 pushState/replaceState 的 url 解析并更新 location。
   * @param url history API 传入的 URL
   */
  function applyUrl(url: string) {
    const raw = url.replace(/^http:\/\/localhost/i, '');
    const hashIdx = raw.indexOf('#');
    const beforeHash = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
    const qIdx = beforeHash.indexOf('?');
    if (qIdx >= 0) {
      pathname = beforeHash.slice(0, qIdx) || '/';
      search = beforeHash.slice(qIdx);
    } else {
      pathname = beforeHash || '/';
    }
    if (hashIdx >= 0) hash = raw.slice(hashIdx);
  }

  const history = {
    get state() { return historyState; },
    set state(v: Record<string, unknown>) { historyState = v; },
    length: 10,
    pushState: jest.fn((state: Record<string, unknown>, _title: string, url?: string) => {
      historyState = state;
      if (url) applyUrl(url);
    }),
    replaceState: jest.fn((state: Record<string, unknown>, _title: string, url?: string) => {
      historyState = state;
      if (url) applyUrl(url);
    }),
    go: jest.fn((_delta: number) => {
      (listeners[PopStateEventType] || []).forEach((fn) => fn({ type: PopStateEventType }));
    }),
    back: jest.fn(),
    forward: jest.fn(),
  };

  const win = {
    location,
    history,
    addEventListener: (type: string, fn: Function) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    },
    removeEventListener: (type: string, fn: Function) => {
      listeners[type] = (listeners[type] || []).filter((f) => f !== fn);
    },
    dispatchEvent: (event: { type: string }) => {
      (listeners[event.type] || []).forEach((fn) => fn(event));
      return true;
    },
    document: {
      querySelector: jest.fn(() => ({
        getAttribute: () => 'http://localhost/',
      })),
      defaultView: null as unknown as HeavyHistoryWindow,
    },
    __heavyHistory: {
      setPath(p: string, s = '', h = '') {
        pathname = p;
        search = s;
        hash = h;
      },
      stripStateIdx() {
        const { idx: _idx, ...rest } = historyState;
        historyState = rest;
      },
      setState(state: Record<string, unknown>) {
        historyState = state;
      },
      firePopState() {
        (listeners[PopStateEventType] || []).forEach((fn) => fn({ type: PopStateEventType }));
      },
      fireHashChange() {
        (listeners[HashChangeEventType] || []).forEach((fn) => fn({ type: HashChangeEventType }));
      },
    },
  };

  win.document.defaultView = win;
  return win as unknown as HeavyHistoryWindow;
}

/**
 * 在测试期间替换 globalThis.location（jsdom 下 delete 后赋值）。
 * @param href 模拟的完整 href
 * @param fn 测试回调
 */
export function withMockLocationHref<T>(href: string, fn: () => T): T {
  const hashIdx = href.indexOf('#');
  const searchIdx = href.indexOf('?');
  const mockLoc = {
    href,
    search: searchIdx >= 0 ? href.slice(searchIdx, hashIdx >= 0 ? hashIdx : undefined) : '',
    pathname: href.replace(/^https?:\/\/[^/]+/, '').split('?')[0].split('#')[0] || '/',
    hash: hashIdx >= 0 ? href.slice(hashIdx) : '',
    assign: jest.fn(),
    replace: jest.fn(),
  };
  const saved = globalThis.location;
  delete (globalThis as any).location;
  (globalThis as any).location = mockLoc;
  try {
    return fn();
  } finally {
    delete (globalThis as any).location;
    (globalThis as any).location = saved;
  }
}

/**
 * 清除 REACT_VIEW_ROUTER_GLOBAL 中缓存的 hash/browser history，避免用例互相污染。
 */
export function clearGlobalHistoryCache() {
  const { REACT_VIEW_ROUTER_GLOBAL } = require('../../src/history-fix');
  REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined;
  REACT_VIEW_ROUTER_GLOBAL.historys.browser = undefined;
}

export { HistoryType, PopStateEventType };
