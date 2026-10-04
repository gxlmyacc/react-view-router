import {
  createMemoryHistory,
  createHashHistory,
  createBrowserHistory,
  getPossibleHistory,
  confirmInterceptors,
  isHistory4,
  REACT_VIEW_ROUTER_GLOBAL,
} from '../src/history-fix';
import { HistoryType } from '../src/history/types';
import ReactViewRouter from '../src/router';

/**
 * 创建 mock window 供 hash/browser history 测试使用。
 * @returns mock Window
 */
function createMockWindow() {
  const location = {
    pathname: '/',
    search: '',
    hash: '#/',
    href: 'http://localhost/#/',
    assign: jest.fn(),
    replace: jest.fn(),
  };
  const history = {
    state: { idx: 0, usr: null, key: 'default' },
    length: 1,
    pushState: jest.fn(),
    replaceState: jest.fn(),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  };
  const win = {
    location,
    history,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    document: { querySelector: () => null, defaultView: null as any },
  };
  win.document.defaultView = win;
  return win as unknown as Window;
}

describe('history-fix', () => {
  afterEach(() => {
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined as any;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = undefined as any;
    sessionStorage.clear();
  });

  it('createMemoryHistory 应返回 HistoryFix 实例', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const history = createMemoryHistory({}, router);
    expect(history.isHistoryInstance).toBe(true);
    expect(history.type).toBe(HistoryType.memory);
    expect(history.stacks).toBeDefined();
    expect(history.interceptors).toBeDefined();
    router.stop();
  });

  it('createHashHistory 应创建并缓存全局 hash history', () => {
    const win = createMockWindow();
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.hash });
    const h1 = createHashHistory({ window: win }, router);
    const h2 = createHashHistory({ window: win }, router);
    expect(h1).toBe(h2);
    expect(h1.type).toBe(HistoryType.hash);
    router.stop();
  });

  it('createBrowserHistory 应创建并缓存全局 browser history', () => {
    const win = createMockWindow();
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.browser });
    const h1 = createBrowserHistory({ window: win }, router);
    const h2 = createBrowserHistory({ window: win }, router);
    expect(h1).toBe(h2);
    expect(h1.type).toBe(HistoryType.browser);
    router.stop();
  });

  it('getPossibleHistory 应返回已缓存的 history', () => {
    const win = createMockWindow();
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.hash });
    createHashHistory({ window: win }, router);
    expect(getPossibleHistory()).toBe(REACT_VIEW_ROUTER_GLOBAL.historys.hash);
    router.stop();
  });

  it('history 应支持 createHistory4', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const history4 = router.history.createHistory4({ basename: '/app' });
    expect(isHistory4(history4)).toBe(true);
    expect(history4.goBack).toBeDefined();
    expect(history4.location.pathname).toBeDefined();
    router.stop();
  });

  it('history4 push/replace 应委托给 owner', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const history4 = router.history.createHistory4();
    history4.push('/test');
    expect(router.history.location.pathname).toBe('/test');
    router.stop();
  });

  it('interceptorTransitionTo 应注册并注销拦截器', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const interceptor = jest.fn((_loc, cb) => cb(true));
    const before = router.history.interceptors.length;
    const unregister = router.history.interceptorTransitionTo(interceptor, router);
    expect(router.history.interceptors.length).toBe(before + 1);
    unregister();
    expect(router.history.interceptors.some((v: any) => v.interceptor === interceptor)).toBe(false);
    router.stop();
  });

  it('confirmInterceptors 应依次执行拦截器', () => {
    const calls: string[] = [];
    const mockRouter = { isRunning: true } as ReactViewRouter;
    const interceptors = [
      { interceptor: (_loc: any, cb: any) => { calls.push('a'); cb(true); }, router: mockRouter },
      { interceptor: (_loc: any, cb: any) => { calls.push('b'); cb(true); }, router: mockRouter },
    ];
    return new Promise<void>(resolve => {
      confirmInterceptors(interceptors as any, { path: '/' } as any, ok => {
        expect(ok).toBe(true);
        expect(calls).toEqual(['a', 'b']);
        resolve();
      });
    });
  });

  it('confirmInterceptors 拦截失败时应回调 false', () => {
    const mockRouter = { isRunning: true } as ReactViewRouter;
    const interceptors = [
      { interceptor: (_loc: any, cb: any) => cb(false), router: mockRouter },
    ];
    return new Promise<void>(resolve => {
      confirmInterceptors(interceptors as any, { path: '/' } as any, ok => {
        expect(ok).toBe(false);
        resolve();
      });
    });
  });

  it('memory history stacks 不应写入 sessionStorage', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    router.history.push('/page');
    expect(router.history.stacks.length).toBeGreaterThan(0);
    router.stop();
  });

  it('hash history stacks 应写入 sessionStorage', () => {
    const win = createMockWindow();
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.hash });
    const history = createHashHistory({ window: win }, router);
    history.push('/hash-page');
    const key = Object.keys(sessionStorage).find(k => k.includes('HASH_STACKS'));
    expect(key).toBeTruthy();
    router.stop();
  });

  it('browser history stack 应保存 Navigation API entry key', () => {
    const win = createMockWindow();
    (win as any).navigation = { currentEntry: { key: 'initial-entry-key' } };
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.browser });
    const history = createBrowserHistory({ window: win }, router);

    expect(history.stacks[0].navigationKey).toBe('initial-entry-key');
    const key = Object.keys(sessionStorage).find(k => k.includes('BROWSER_STACKS'))!;
    expect(sessionStorage.getItem(key)).toContain('initial-entry-key');
    router.stop();
  });
});
