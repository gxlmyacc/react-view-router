import { createHashHistory, createHashHref } from '../src/history/hash';
import { createBrowserHistory, createBrowserHref } from '../src/history/browser';
import { HistoryType } from '../src/history/types';

/**
 * 创建用于 hash/browser history 测试的 mock window。
 * @param hash 初始 hash
 * @param search 初始 search
 * @returns mock Window 对象
 */
function createMockWindow(hash = '', search = '') {
  let currentHash = hash;
  let currentSearch = search;
  const listeners: Record<string, Function[]> = {};

  const location = {
    get hash() { return currentHash; },
    set hash(v: string) { currentHash = v; },
    get search() { return currentSearch; },
    set search(v: string) { currentSearch = v; },
    href: 'http://localhost/',
    assign: jest.fn(),
    replace: jest.fn(),
  };

  const history = {
    state: { idx: 0, usr: null, key: 'default' },
    pushState: jest.fn((state: any, _title: string, url: string) => {
      if (url.includes('#')) currentHash = url.slice(url.indexOf('#'));
      history.state = state;
    }),
    replaceState: jest.fn((state: any, _title: string, url: string) => {
      if (url.includes('#')) currentHash = url.slice(url.indexOf('#'));
      history.state = state;
    }),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    length: 1,
  };

  return {
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
    },
    document: {
      querySelector: () => null,
      defaultView: null as any,
    },
  } as unknown as Window;
}

describe('createHashHistory', () => {
  it('应创建 hash 历史实例', () => {
    const win = createMockWindow('#/');
    (win.document as any).defaultView = win;
    const history = createHashHistory({ window: win });
    expect(history.type).toBe(HistoryType.hash);
    expect(history.hashType).toBe('slash');
  });

  it('push 应更新 hash', () => {
    const win = createMockWindow('#/');
    (win.document as any).defaultView = win;
    const history = createHashHistory({ window: win });
    history.push('/about');
    expect(win.history.pushState).toHaveBeenCalled();
  });

  it('createHashHref 应合并 location.search', () => {
    const win = createMockWindow();
    (win as any).location.search = '?from=loc';
    (win.document as any).defaultView = win;
    const href = createHashHref('/page?from=loc&extra=1', 'slash', win);
    expect(href).toContain('#');
    expect(href).toContain('/page');
  });

  it('getLocationPath 应合并 hash 与 search', () => {
    const win = createMockWindow('#/dashboard?tab=1');
    (win as any).location.search = '?global=1';
    (win.document as any).defaultView = win;
    const history = createHashHistory({ window: win });
    expect(history.location.pathname).toBeTruthy();
  });

  it('getLocationPath hash 无 query 时应追加 location.search', () => {
    const win = createMockWindow('#/page');
    (win as any).location.search = '?q=1';
    (win.document as any).defaultView = win;
    const history = createHashHistory({ window: win });
    expect(history.location.search).toContain('q=1');
  });

  it('createHashHref 无 hash 前缀时应自动添加', () => {
    const href = createHashHref('/path', 'slash');
    expect(href).toContain('#');
  });

  it('createHashHref 无重复 search 时不应重复拼接', () => {
    const win = createMockWindow();
    (win as any).location.search = '';
    const href = createHashHref('/only', 'slash', win);
    expect(href).toContain('#/only');
  });

  it('createHashHref 应去除与 location 重复的 query', () => {
    const win = createMockWindow();
    (win as any).location.search = '?dup=1';
    (win.document as any).defaultView = win;
    const href = createHashHref('/path?dup=1&extra=2', 'slash', win);
    expect(href).toContain('extra=2');
    expect(href).not.toContain('dup=1');
  });

  it('createHashHref 无 search 时不应拼接 location', () => {
    const win = createMockWindow();
    (win as any).location.search = '';
    const href = createHashHref('/only', 'slash', win);
    expect(href).toContain('#/only');
  });

  it('location search 为空或全部重复时保持正确 query', () => {
    const emptySearch = createMockWindow();
    expect(createHashHref('/path?local=1', 'slash', emptySearch)).toContain('/path?local=1');
    const duplicateSearch = createMockWindow('', '?dup=1');
    expect(createHashHref('/path?dup=1', 'slash', duplicateSearch)).toContain('#/path');
    expect(createHashHref('/path?dup=1', 'slash', duplicateSearch)).not.toContain('?dup=1');
  });

  it('location 中不存在的 query 不会移除 hash query', () => {
    const win = createMockWindow('', '?not-in-hash=1');
    expect(createHashHref('/path?keep=1', 'slash', win)).toContain('/path?keep=1');
  });

  it('createHashHistory 无 options 时使用当前浏览器 window', () => {
    const history = createHashHistory();
    expect(history.type).toBe(HistoryType.hash);
    expect(history.hashType).toBeDefined();
  });

  it('createHashHistory hash 无斜杠前缀应补全 pathname', () => {
    const win = createMockWindow('page');
    (win.document as any).defaultView = win;
    const history = createHashHistory({ window: win });
    expect(history.location.pathname.startsWith('/')).toBe(true);
  });
});

describe('createBrowserHistory', () => {
  it('无参创建应使用默认 window', () => {
    const history = createBrowserHistory();
    expect(history.type).toBe(HistoryType.browser);
    expect(history.createHref('/x')).toBe('/x');
  });

  it('应创建 browser 历史实例', () => {
    const win = createMockWindow();
    (win.document as any).defaultView = win;
    const history = createBrowserHistory({ window: win });
    expect(history.type).toBe(HistoryType.browser);
  });

  it('createBrowserHref 应生成路径', () => {
    expect(createBrowserHref('/about')).toBe('/about');
  });

  it('listen 应注册监听器', () => {
    const win = createMockWindow();
    (win.document as any).defaultView = win;
    const history = createBrowserHistory({ window: win });
    const listener = jest.fn();
    const unlisten = history.listen(listener);
    expect(typeof unlisten).toBe('function');
    unlisten();
  });

  it('push 应调用 createHref 生成 URL', () => {
    const win = createMockWindow();
    (win.document as any).defaultView = win;
    const history = createBrowserHistory({ window: win, hashType: 'slash' });
    history.push('/target?x=1');
    expect(win.history.pushState).toHaveBeenCalled();
    const urlArg = (win.history.pushState as jest.Mock).mock.calls[0][2] as string;
    expect(urlArg).toContain('/target');
  });

  it('未传 hashType 时应使用默认 hashType', () => {
    const win = createMockWindow();
    (win.document as any).defaultView = win;
    const history = createBrowserHistory({ window: win });
    history.push('/default');
    expect(history.createHref('/x')).toBe('/x');
  });
});
