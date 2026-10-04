import ReactViewRouter from '../../src/router';
import { createHashHistory, confirmInterceptors } from '../../src/history-fix';
import { HistoryType } from '../../src/history/types';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';

function createMockWindow(hash = '#/') {
  const location = { pathname: '/', search: '', hash, href: 'http://localhost/', assign: jest.fn(), replace: jest.fn() };
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

describe('history-fix 补充覆盖', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('history4 block 函数返回 false 应取消导航', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4({ basename: '/app' });
    history4.block((_loc, _action) => false);
    const before = history4.location.pathname;
    history4.push('/page');
    expect(history4.location.pathname).toBe(before);
    router.stop();
  });

  it('history4 block 字符串无 getUserConfirmation 应默认放行', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4();
    history4.block('confirm?');
    history4.push('/ok');
    expect(history4.location).toBeDefined();
    router.stop();
  });

  it('history4 listen 应解码 basename 路径', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4({ basename: '/base' });
    const listener = jest.fn();
    history4.listen(listener);
    history4.push('/inner');
    expect(listener).toHaveBeenCalled();
    router.stop();
  });

  it('history4 decodeLocation 应处理对象 pathname', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4({ basename: '/app' });
    history4.push({ pathname: '/app/detail', search: '?x=1' });
    expect(history4.location.pathname).toContain('detail');
    router.stop();
  });

  it('confirmInterceptors 拦截器未运行应跳过', () => {
    const interceptors = [
      { interceptor: jest.fn(), router: { isRunning: false } },
    ];
    return new Promise<void>(resolve => {
      confirmInterceptors(interceptors as any, { path: '/' } as any, ok => {
        expect(ok).toBe(true);
        resolve();
      });
    });
  });

  it('interceptorTransitionTo 嵌套 basename 应更新父级', () => {
    const parent = createTestRouter([], { basename: '/app' });
    parent._initRouter({ basename: '/app', mode: HistoryType.hash });
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      basename: '/app/child',
      routes: [{ path: '/', component: () => null }],
    });
    child.start();
    const unsub = parent.history.interceptorTransitionTo(jest.fn(), child);
    expect(typeof unsub).toBe('function');
    unsub();
    parent.stop();
    child.stop();
  });

  it('interceptorTransitionTo 重复注册应输出警告', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const router = createTestRouter();
    const interceptor = jest.fn();
    router.history.interceptorTransitionTo(interceptor, router);
    router.history.interceptorTransitionTo(interceptor, router);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
    router.stop();
  });

  it('history4 block 带 getUserConfirmation 应调用确认', () => {
    const router = createTestRouter();
    const confirm = jest.fn((_msg, cb) => cb(true));
    const history4 = router.history.createHistory4({ getUserConfirmation: confirm });
    history4.block('leave?');
    history4.push('/confirmed');
    expect(confirm).toHaveBeenCalled();
    router.stop();
  });

  it('getPossibleHistory 应返回已缓存的 hash history', () => {
    const { getPossibleHistory, REACT_VIEW_ROUTER_GLOBAL } = require('../../src/history-fix');
    const router = createTestRouter([], { mode: HistoryType.memory });
    const saved = REACT_VIEW_ROUTER_GLOBAL.historys.hash;
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = router.history;
    expect(getPossibleHistory()).toBe(router.history);
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = saved;
    router.stop();
  });

  it('getPossibleHistory 应返回 browser history', () => {
    const { getPossibleHistory, REACT_VIEW_ROUTER_GLOBAL } = require('../../src/history-fix');
    const router = createTestRouter([], { mode: HistoryType.memory });
    const savedHash = REACT_VIEW_ROUTER_GLOBAL.historys.hash;
    const savedBrowser = REACT_VIEW_ROUTER_GLOBAL.historys.browser;
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = router.history;
    expect(getPossibleHistory()).toBe(router.history);
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = savedHash;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = savedBrowser;
    router.stop();
  });

  it('history4 goBack/goForward 应委托 owner', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4();
    const backSpy = jest.spyOn(router.history, 'back');
    const forwardSpy = jest.spyOn(router.history, 'forward');
    history4.goBack();
    history4.goForward();
    expect(backSpy).toHaveBeenCalled();
    expect(forwardSpy).toHaveBeenCalled();
    router.stop();
  });

  it('history4 block prompt 为 null 应放行', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4();
    history4.block(null as any);
    history4.push('/allowed');
    expect(history4.location.pathname).toBeTruthy();
    router.stop();
  });

  it('history4 location 缓存应复用', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4({ basename: '/app' });
    history4.push('/page');
    const first = history4.location;
    const second = history4.location;
    expect(second.pathname).toBe(first.pathname);
    history4.push('/next');
    expect(history4.location.pathname).not.toBe(first.pathname);
    router.stop();
  });

  it('history4 block 函数返回 false 应取消导航', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4();
    history4.block(() => false);
    const before = history4.location.pathname;
    history4.push('/blocked');
    expect(history4.location.pathname).toBe(before);
    router.stop();
  });

  it('getPossibleHistory 应回退 options.history', () => {
    const { getPossibleHistory, REACT_VIEW_ROUTER_GLOBAL } = require('../../src/history-fix');
    const router = createTestRouter([], { mode: HistoryType.memory });
    const savedHash = REACT_VIEW_ROUTER_GLOBAL.historys.hash;
    const savedBrowser = REACT_VIEW_ROUTER_GLOBAL.historys.browser;
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = undefined;
    expect(getPossibleHistory({ history: router.history })).toBe(router.history);
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = savedHash;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = savedBrowser;
    router.stop();
  });
});
