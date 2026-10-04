import { createHistory, HashChangeEventType, PopStateEventType } from '../src/history/history';
import { HistoryType, Action } from '../src/history/types';

/**
 * 创建完整的 mock window 用于 history 核心测试。
 * @param pathname 初始路径
 * @returns mock Window
 */
function createMockWindow(pathname = '/') {
  let currentPathname = pathname;
  const eventListeners: Record<string, Function[]> = {};

  const location = {
    get pathname() { return currentPathname; },
    set pathname(v: string) { currentPathname = v; },
    search: '',
    hash: '',
    href: `http://localhost${pathname}`,
    assign: jest.fn(),
    replace: jest.fn(),
  };

  const history = {
    state: { idx: 0, usr: null, key: 'default' },
    length: 1,
    pushState: jest.fn((state: any, _t: string, url: string) => {
      history.state = state;
      const path = url.replace('http://localhost', '').split('?')[0];
      if (path) currentPathname = path;
    }),
    replaceState: jest.fn((state: any, _t: string, url?: string) => {
      history.state = state;
      if (url) {
        const path = url.replace('http://localhost', '').split('?')[0];
        if (path) currentPathname = path;
      }
    }),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  };

  const win = {
    location,
    history,
    addEventListener: (type: string, fn: Function) => {
      eventListeners[type] = eventListeners[type] || [];
      eventListeners[type].push(fn);
    },
    removeEventListener: (type: string, fn: Function) => {
      eventListeners[type] = (eventListeners[type] || []).filter((f) => f !== fn);
    },
    dispatchEvent: (event: { type: string }) => {
      (eventListeners[event.type] || []).forEach((fn) => fn(event));
    },
    document: { querySelector: () => null, defaultView: null as any },
  };
  win.document.defaultView = win;
  return win as unknown as Window;
}

describe('createHistory 核心', () => {
  it('应创建 history 并支持 push/replace', () => {
    const win = createMockWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : to.pathname || '/'),
    });

    expect(history.type).toBe(HistoryType.browser);
    expect(history.location.pathname).toBe('/');

    const listener = jest.fn();
    history.listen(listener);

    history.push('/about');
    expect(listener).toHaveBeenCalled();
    expect(history.action).toBe(Action.Push);

    history.replace('/contact');
    expect(history.action).toBe(Action.Replace);
  });

  it('block 应阻止 push', () => {
    const win = createMockWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    history.block(({ callback }) => callback(false));
    history.push('/blocked');
    expect(history.location.pathname).toBe('/');
  });

  it('replaceState 应返回新 state', () => {
    const win = createMockWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    expect(history.replaceState({ foo: 1 })).toEqual({ foo: 1 });
    expect(win.history.replaceState).toHaveBeenCalled();
  });

  it('应导出事件类型常量', () => {
    expect(HashChangeEventType).toBe('hashchange');
    expect(PopStateEventType).toBe('popstate');
  });

  it('createHref 应通过 history.createHref 生成链接', () => {
    const win = createMockWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/custom'),
    });
    expect(history.createHref('/test')).toBe('/test');
  });

  it('listen 返回的函数应取消订阅', () => {
    const win = createMockWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    const listener = jest.fn();
    const unlisten = history.listen(listener);
    unlisten();
    history.push('/x');
    expect(listener).not.toHaveBeenCalled();
  });

  it('pushState 丢失 idx 时应从前一个索引推算新索引', () => {
    const win = createMockWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : to.pathname || '/'),
    });
    (win.history as any).state = { usr: null, key: 'legacy' };
    (win.history.pushState as jest.Mock).mockImplementation(() => undefined);

    history.push('/next');

    expect(history.index).toBe(1);
    expect(history.location.pathname).toBe('/');
  });

  it('popstate 缺少 idx 时应忽略同路径事件并重建不同路径索引', () => {
    const win = createMockWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : to.pathname || '/'),
    });
    const listener = jest.fn();
    history.listen(listener);
    (win.history as any).state = { usr: null, key: 'legacy' };

    win.dispatchEvent({ type: PopStateEventType });
    expect(listener).not.toHaveBeenCalled();
    expect((win.history.state as any).idx).toBe(0);

    (win.history as any).state = { usr: null, key: 'legacy' };
    win.location.pathname = '/next';
    win.dispatchEvent({ type: PopStateEventType });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(history.index).toBe(1);
  });
});
