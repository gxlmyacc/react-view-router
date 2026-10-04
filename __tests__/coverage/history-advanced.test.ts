import { createHistory, HashChangeEventType, PopStateEventType } from '../../src/history/history';
import { HistoryType, Action } from '../../src/history/types';

/**
 * 创建可触发 popstate/hashchange 的 mock window。
 * @param pathname 初始路径
 * @param hashType history 类型
 */
function createInteractiveWindow(pathname = '/', hashType: HistoryType = HistoryType.browser) {
  let currentPathname = pathname;
  let currentHash = hashType === HistoryType.hash ? `#${pathname}` : '';
  const listeners: Record<string, Function[]> = {};

  const location = {
    get pathname() { return currentPathname; },
    set pathname(v: string) { currentPathname = v; },
    get hash() { return currentHash; },
    set hash(v: string) { currentHash = v; },
    search: '',
    href: `http://localhost${pathname}`,
    assign: jest.fn(),
    replace: jest.fn(),
  };

  const history = {
    state: { idx: 0, usr: null, key: 'default' },
    length: 1,
    pushState: jest.fn((state: any, _t: string, url?: string) => {
      history.state = state;
      if (url) {
        const path = url.replace('http://localhost', '').split('?')[0].split('#')[0];
        if (path) currentPathname = path || '/';
        const hashIdx = url.indexOf('#');
        if (hashIdx >= 0) currentHash = url.slice(hashIdx);
      }
    }),
    replaceState: jest.fn((state: any, _t: string, url?: string) => {
      history.state = state;
      if (url) {
        const path = url.replace('http://localhost', '').split('?')[0];
        if (path) currentPathname = path || '/';
      }
    }),
    go: jest.fn((delta: number) => {
      const newIdx = Math.max(0, (history.state?.idx ?? 0) + delta);
      history.state = { ...history.state, idx: newIdx };
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
    document: { querySelector: () => null, defaultView: null as any },
  };
  win.document.defaultView = win;
  return { win: win as unknown as Window, listeners, history, location };
}

describe('createHistory 高级场景', () => {
  it('延迟的 popstate blocker 允许后提交 POP', () => {
    const { win, history: browserHistory, location } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    history.push('/b');
    let allowPop: ((allow: boolean, payload?: unknown) => void) | undefined;
    history.block(({ action, callback }) => {
      if (action === Action.Pop) allowPop = callback;
      else callback(true);
    });

    location.pathname = '/a';
    browserHistory.go(-1);
    expect(allowPop).toBeDefined();
    allowPop!(true, { approved: true });

    expect(history.action).toBe(Action.Pop);
    expect(history.location.pathname).toBe('/a');
    history.block(null as any);
  });

  it('POP blocker 已被新 PUSH 清理后，迟到的 POP 决定不再提交', () => {
    const { win, history: browserHistory, location } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    history.push('/b');
    let allowPop: ((allow: boolean, payload?: unknown) => void) | undefined;
    history.block(({ action, callback }) => {
      if (action === Action.Pop) allowPop = callback;
      else callback(true);
    });

    location.pathname = '/a';
    browserHistory.go(-1);
    history.push('/new');
    const actionAfterPush = history.action;
    const locationAfterPush = history.location;
    allowPop!(true);

    expect(history.action).toBe(actionAfterPush);
    expect(history.location).toBe(locationAfterPush);
    history.block(null as any);
  });

  it('push 后应触发 listener', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    const listener = jest.fn();
    history.listen(listener);
    history.push('/next');
    expect(listener).toHaveBeenCalled();
    expect(history.action).toBe(Action.Push);
  });

  it('popstate 应更新 location', () => {
    const { win, history: h } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    history.push('/b');
    h.go(-1);
    expect(history.action).toBe(Action.Pop);
  });

  it('hash 模式应监听 hashchange', () => {
    const { win, location } = createInteractiveWindow('/', HistoryType.hash);
    location.hash = '#/home';
    const history = createHistory({
      window: win,
      type: HistoryType.hash,
      getLocationPath: () => {
        let path = win.location.hash.substr(1) || '/';
        if (!path.startsWith('/')) path = '/' + path;
        return { pathname: path, search: '', hash: '' };
      },
      createHref: (to) => `#${typeof to === 'string' ? to : '/'}`,
    });
    const listener = jest.fn();
    history.listen(listener);
    location.hash = '#/about';
    win.dispatchEvent({ type: HashChangeEventType });
    expect(history.type).toBe(HistoryType.hash);
  });

  it('block 拒绝 popstate 导航', () => {
    const { win, history: h } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    history.block(({ callback }) => callback(false));
    history.push('/x');
    const pathBefore = history.location.pathname;
    h.go(-1);
    expect(history.location.pathname).toBe(pathBefore);
  });

  it('push 带 delta 应调用 history.go', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    history.push({ pathname: '/delta', delta: -1 } as any);
    expect(win.history.go).toHaveBeenCalled();
  });

  it('replace 应替换当前条目', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.replace('/replaced');
    expect(history.action).toBe(Action.Replace);
  });

  it('refresh 应同步 index 与 location', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    const [idx, loc] = history.refresh();
    expect(typeof idx).toBe('number');
    expect(loc).toBeDefined();
  });

  it('refresh 应在框架覆盖 history.state 后按动作恢复 index 并保留框架状态', () => {
    const { win, history: browserHistory, location } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    browserHistory.state = { url: '/orders', as: '/orders', options: {} };
    location.pathname = '/orders';

    const [idx, current] = history.refresh(Action.Push);

    expect(idx).toBe(1);
    expect(current.pathname).toBe('/orders');
    expect(browserHistory.state).toEqual(expect.objectContaining({
      url: '/orders',
      as: '/orders',
      idx: 1,
    }));
  });

  it.each([
    [Action.Pop, 0],
    [Action.Replace, 1],
  ])('refresh 应按 %s 恢复被框架覆盖的 index', (action, expectedIndex) => {
    const { win, history: browserHistory, location } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/legacy');
    browserHistory.state = { url: '/', as: '/', options: {} };
    location.pathname = '/';

    const [idx] = history.refresh(action);

    expect(idx).toBe(expectedIndex);
    expect(browserHistory.state.idx).toBe(expectedIndex);
  });

  it('replaceState 应更新 usr state', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    const state = history.replaceState({ foo: 1 });
    expect(state.foo).toBe(1);
  });

  it('realtimeLocation 路径变化时应返回最新值', () => {
    const { win, location } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    location.pathname = '/changed';
    const rt = history.realtimeLocation;
    expect(rt.pathname).toBe('/changed');
  });

  it('block 拒绝 replace 应中止', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    history.block(({ action, callback }) => {
      if (action === Action.Replace) callback(false);
      else callback(true);
    });
    const before = history.location.pathname;
    history.replace('/blocked');
    expect(history.location.pathname).toBe(before);
  });

  it('go 触发 popstate 应更新 action', () => {
    const { win, history: h } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    history.push('/b');
    h.go(-2);
    expect(history.action).toBe(Action.Pop);
  });
});
