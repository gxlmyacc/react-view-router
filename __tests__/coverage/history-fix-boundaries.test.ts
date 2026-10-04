import {
  confirmInterceptors, createMemoryHistory, createBrowserHistory, createHashHistory, REACT_VIEW_ROUTER_GLOBAL,
} from '../../src/history-fix';
import ReactViewRouter from '../../src/router';
import { HistoryType } from '../../src/history/types';
import { createTestRouter } from '../helpers/test-utils';
import { createHeavyHistoryWindow } from '../helpers/heavy-history-mock';

describe('history 适配边界', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = undefined;
    sessionStorage.clear();
  });

  it.each([
    [HistoryType.memory, createMemoryHistory],
    [HistoryType.browser, createBrowserHistory],
    [HistoryType.hash, createHashHistory],
  ] as const)('%s adapter 解包已有 History4 owner', (mode, create) => {
    const owner = new ReactViewRouter({ manual: true, mode });
    const win = createHeavyHistoryWindow({ hashMode: mode === HistoryType.hash });
    const history = create({ window: win } as any, owner);
    const legacy = history.createHistory4();
    expect(create({ history: legacy } as any, owner)).toBe(history);
    owner.stop();
  });

  it('History4 清理独立的 query/hash 分隔符和空路径', () => {
    const router = createTestRouter();
    const history = router.history.createHistory4();
    history.push('');
    expect(history.location.pathname).toBe('/');
    history.push('/markers?#');
    expect(history.location).toMatchObject({ pathname: '/markers', search: '', hash: '' });
    history.replace({ pathname: '/object', search: '?', hash: '#' });
    expect(history.location).toMatchObject({ pathname: '/object', search: '', hash: '' });
    const unblock = history.block(true);
    unblock();
    unblock();
    expect(history.createHref({ pathname: '/object', search: '?', hash: '#' })).toBe('/object');
    router.stop();
  });

  it.each([false, true])('已有 session stack 与当前 index 一致时不重复追加（query=%s）', (hasQuery) => {
    const owner = new ReactViewRouter({ manual: true, mode: HistoryType.browser });
    const stack = { index: 0, pathname: '/', search: '?saved=1', timestamp: 1, ...(hasQuery ? { query: { saved: '1' } } : {}) };
    sessionStorage.setItem('_REACT_VIEW_ROUTER_BROWSER_STACKS_', JSON.stringify([stack]));
    const history = createBrowserHistory({ window: createHeavyHistoryWindow() }, owner);
    expect(history.stacks).toHaveLength(1);
    expect(history.stacks[0].query).toEqual({ saved: '1' });
    owner.stop();
  });

  it('History4 允许非 URIError 的解码异常原样传播', () => {
    const router = createTestRouter();
    const history = router.history.createHistory4();
    const error = new Error('decoder failed');
    jest.spyOn(globalThis, 'decodeURI').mockImplementation(() => { throw error; });
    expect(() => history.push('/test')).toThrow(error);
    router.stop();
  });

  it('同一 interceptor 替换 router 并更新最深父路由，重复卸载安全', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const owner = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const history = createMemoryHistory({}, owner);
    const makeRouter = (basename: string) => ({ basename, stop: jest.fn(), _updateParent: jest.fn() });
    const root = makeRouter('/app');
    const parent = makeRouter('/app/deep');
    const child = makeRouter('/app/deep/page');
    const callback = jest.fn();
    history.interceptorTransitionTo(jest.fn(), root as any);
    history.interceptorTransitionTo(jest.fn(), parent as any);
    const unregister = history.interceptorTransitionTo(callback, child as any);
    expect(child._updateParent).toHaveBeenCalledWith(parent);
    const replacement = makeRouter('/app/deep/replacement');
    history.interceptorTransitionTo(callback, replacement as any);
    expect(child.stop).toHaveBeenCalledTimes(1);
    expect(replacement._updateParent).toHaveBeenCalledWith(parent);
    unregister();
    unregister();
    expect(history.interceptors.some((item) => item.interceptor === callback)).toBe(false);
    owner.stop();
  });

  it('runtime adapter 同步或异步无结果时尝试下一个 adapter', async () => {
    const commits = [jest.fn(() => null), jest.fn(() => Promise.resolve(null))];
    const items = commits.map((commit) => ({
      interceptor: (_location: any, callback: Function) => callback(true, { path: '/' }),
      router: {
        isRunning: true,
        _hasRouteRuntimeNavigationAdapters: () => true,
        _commitRouteRuntimeNavigation: commit,
      },
    }));
    const allowed = await new Promise((resolve) => {
      confirmInterceptors(items as any, { path: '/' } as any, (ok) => resolve(ok));
    });
    expect(allowed).toBe(true);
    expect(commits[0]).toHaveBeenCalledTimes(1);
    expect(commits[1]).toHaveBeenCalledTimes(1);
  });
});
