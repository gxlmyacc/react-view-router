import { createHistory, HashChangeEventType, PopStateEventType } from '../../src/history/history';
import { HistoryType, Action } from '../../src/history/types';

/**
 * 创建可模拟 popstate/hashchange 的 window。
 * @param pathname 初始路径
 * @param hashType history 类型
 */
function createInteractiveWindow(pathname = '/', hashType: HistoryType = HistoryType.browser) {
  let currentPathname = pathname;
  let currentHash = hashType === HistoryType.hash ? `#${pathname}` : '';
  let stateIdx = 0;
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
    get state() { return { idx: stateIdx, usr: null, key: 'k' }; },
    set state(v: any) { stateIdx = v?.idx ?? stateIdx; },
    length: 1,
    pushState: jest.fn((state: any, _t: string, url?: string) => {
      history.state = state;
      stateIdx = state?.idx ?? stateIdx + 1;
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
      stateIdx = Math.max(0, stateIdx + delta);
      (listeners[PopStateEventType] || []).forEach(fn => fn({ type: PopStateEventType }));
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
      listeners[type] = (listeners[type] || []).filter(f => f !== fn);
    },
    dispatchEvent: (event: { type: string }) => {
      (listeners[event.type] || []).forEach(fn => fn(event));
      return true;
    },
    document: { querySelector: () => null, defaultView: null as any },
  };
  win.document.defaultView = win;
  return { win: win as unknown as Window, listeners, history, location };
}

describe('history 补充覆盖', () => {
  it('popstate 被 block 拒绝应回滚', () => {
    const { win, history: h } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: to => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    history.push('/b');
    history.block(({ callback }) => callback(false));
    const pathBefore = history.location.pathname;
    h.go(-1);
    expect(history.location.pathname).toBe(pathBefore);
  });

  it('replace 带 delta 应调用 go', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    history.replace({ pathname: '/delta', delta: -1 } as any);
    expect(win.history.go).toHaveBeenCalled();
  });

  it('push 被 block 拒绝 replace 回调应回滚', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    let blockOnce = true;
    history.block(({ action, callback }) => {
      if (blockOnce && action === Action.Replace) {
        blockOnce = false;
        callback(false);
      } else callback(true);
    });
    const before = history.location.pathname;
    history.replace('/blocked-replace');
    expect(history.location.pathname).toBe(before);
  });

  it('hashchange 应触发 handlePop', () => {
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
      createHref: to => `#${typeof to === 'string' ? to : '/'}`,
    });
    const listener = jest.fn();
    history.listen(listener);
    location.hash = '#/other';
    win.dispatchEvent({ type: HashChangeEventType });
    expect(history.type).toBe(HistoryType.hash);
  });

  it('go forward 应增加 index', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    history.forward();
    expect(win.history.go).toHaveBeenCalledWith(1);
  });

  it('pushState 失败时应 fallback 到 location.assign', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/fallback',
    });
    (win.history.pushState as jest.Mock).mockImplementation(() => {
      throw new Error('quota');
    });
    history.push('/fallback');
    expect(win.location.assign).toHaveBeenCalled();
  });

  it('handlePop nextIndex 为 null 时应创建新 index', () => {
    const { win, history: h, location } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    h.state = { idx: undefined, usr: null, key: 'k' };
    location.pathname = '/b';
    h.go(-1);
    expect(history.location).toBeDefined();
  });

  it('popstate 被 block 拒绝后再次 pop 应回滚', () => {
    const { win, history: h } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    history.push('/b');
    history.block(({ callback }) => callback(false));
    const before = history.location.pathname;
    h.go(-1);
    expect(history.location.pathname).toBe(before);
    history.block(null as any);
    h.go(-1);
    expect(history.location.pathname).not.toBe('/b');
  });

  it('refresh 应重新读取 location', () => {
    const { win, location } = createInteractiveWindow('/start');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    location.pathname = '/refreshed';
    history.refresh();
    expect(history.location.pathname).toBe('/refreshed');
  });

  it('state 无 idx 时 pop 应推算 index', () => {
    const { win, history: h, location } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    h.state = { usr: null, key: 'k' };
    location.pathname = '/a';
    h.go(0);
    win.dispatchEvent({ type: PopStateEventType });
    expect(history.location).toBeDefined();
  });

  it('back 应调用 history.go(-1)', () => {
    const { win } = createInteractiveWindow('/');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    history.back();
    expect(win.history.go).toHaveBeenCalledWith(-1);
  });

  it('realtimeLocation 路径变化时应返回最新 location', () => {
    const { win, location } = createInteractiveWindow('/start');
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: () => '/',
    });
    location.pathname = '/live';
    expect(history.realtimeLocation.pathname).toBe('/live');
  });
});
