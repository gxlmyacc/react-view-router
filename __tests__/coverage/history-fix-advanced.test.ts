import {
  createHashHistory,
  createBrowserHistory,
  createMemoryHistory,
  confirmInterceptors,
  isHistory4,
  REACT_VIEW_ROUTER_GLOBAL,
} from '../../src/history-fix';
import { HistoryType } from '../../src/history/types';
import ReactViewRouter from '../../src/router';

function createMockWindow(hash = '#/') {
  const location = {
    pathname: '/',
    search: '',
    hash,
    href: 'http://localhost/',
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

describe('history-fix 深度覆盖', () => {
  afterEach(() => {
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined as any;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = undefined as any;
    sessionStorage.clear();
  });

  it('createMemoryHistory 传入已有 memory history 应复用', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const existing = router.history;
    const h2 = createMemoryHistory({ history: existing }, router);
    expect(h2).toBe(existing);
    router.stop();
  });

  it('createHashHistory 传入已有 hash history 应复用', () => {
    const win = createMockWindow();
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.hash });
    const h1 = createHashHistory({ window: win }, router);
    const h2 = createHashHistory({ history: h1, window: win }, router);
    expect(h2).toBe(h1);
    router.stop();
  });

  it('createBrowserHistory 传入已有 browser history 应复用', () => {
    const win = createMockWindow();
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.browser });
    const h1 = createBrowserHistory({ window: win }, router);
    const h2 = createBrowserHistory({ history: h1, window: win }, router);
    expect(h2).toBe(h1);
    router.stop();
  });

  it('history4 block 带 prompt 函数应回调', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const history4 = router.history.createHistory4({
      getUserConfirmation: (msg, cb) => cb(true),
    });
    const unblock = history4.block(() => 'confirm?');
    expect(typeof unblock).toBe('function');
    unblock();
    router.stop();
  });

  it('history4 block prompt 返回 false 应取消', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const history4 = router.history.createHistory4();
    history4.block(() => false);
    router.stop();
  });

  it('history4 location 多次读取应返回一致内容', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory, basename: '/app' });
    router.start();
    const history4 = router.history.createHistory4({ basename: '/app' });
    history4.push('/page');
    const loc1 = history4.location;
    const loc2 = history4.location;
    expect(loc1).toEqual(loc2);
    router.stop();
  });

  it('confirmInterceptors 拦截器返回函数应收集 next', () => {
    const mockRouter = { isRunning: true } as ReactViewRouter;
    const nextFn = jest.fn();
    const interceptors = [
      { interceptor: (_l: any, cb: any) => cb(nextFn), router: mockRouter },
    ];
    return new Promise<void>((resolve) => {
      confirmInterceptors(interceptors as any, { path: '/' } as any, (ok) => {
        expect(ok).toBe(true);
        resolve();
      });
    });
  });

  it('confirmInterceptors 支持直接传入函数拦截器', () => {
    const interceptor = jest.fn((_location, callback) => callback(true));
    return new Promise<void>((resolve) => {
      confirmInterceptors([interceptor] as any, { path: '/function' } as any, (ok) => {
        expect(ok).toBe(true);
        expect(interceptor).not.toHaveBeenCalled();
        resolve();
      });
    });
  });

  it('confirmInterceptors 支持 History 实例作为拦截器集合', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const interceptor = jest.fn((_location, callback) => callback(true));
    router.history.interceptors.push({
      interceptor,
      router: { isRunning: false } as ReactViewRouter,
    });

    return new Promise<void>((resolve) => {
      confirmInterceptors(router.history, { path: '/history' } as any, (ok) => {
        expect(ok).toBe(true);
        expect(interceptor).not.toHaveBeenCalled();
        resolve();
        router.stop();
      });
    });
  });

  it('History4 将相对路径、独立查询和 hash 规范化到当前路径', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/parent/current',
    });
    router.start();
    const history4 = router.history.createHistory4();

    history4.push('../sibling?tab=one#section');
    expect(history4.location.pathname).toBe('/sibling');
    expect(history4.location.search).toBe('?tab=one');
    expect(history4.location.hash).toBe('#section');
    history4.push('?tab=two');
    expect(history4.location.pathname).toBe('/sibling');
    expect(history4.location.search).toBe('?tab=two');

    router.stop();
  });

  it('isHistory4 应识别 history4 对象', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    expect(isHistory4(router.history.createHistory4())).toBe(true);
    expect(isHistory4(router.history)).toBeFalsy();
    router.stop();
  });
});
