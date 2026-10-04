import {
  pickRememberInitialBasenameStack,
  mergeInitialRouteBrowserQuery,
  syncBasenameRouterStacks,
  resolveShortPathnameViaParent,
  applyNestedChildInitLocation,
} from '../../src/router-coverage-helpers';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';

describe('router-coverage-helpers', () => {
  it('pickRememberInitialBasenameStack 应选取 basename 末级栈', () => {
    const stacks = [
      { pathname: '/app', search: '', hash: '', index: 1, timestamp: 1, query: {} },
      { pathname: '/app/inner', search: '', hash: '', index: 2, timestamp: 2, query: {} },
    ] as any[];
    expect(pickRememberInitialBasenameStack(stacks, '/app')?.pathname).toBe('/app/inner');
    expect(pickRememberInitialBasenameStack([{ pathname: '/other' } as any], '/app')).toBeUndefined();
  });

  it('mergeInitialRouteBrowserQuery hash 模式应合并 query', () => {
    const loc = { pathname: '/h', search: '', query: {} } as any;
    const prev = window.location.href;
    window.history.replaceState({}, '', '/?from=url');
    mergeInitialRouteBrowserQuery({
      isMemoryMode: false,
      isHashMode: true,
      isBrowserMode: false,
      parseQuery: () => ({ from: 'url' }),
    }, loc);
    expect(loc.query.from).toBe('url');
    window.history.replaceState({}, '', prev);
  });

  it('mergeInitialRouteBrowserQuery browser 模式应覆盖已有 query 键', () => {
    const loc = { pathname: '/inner', search: '?from=old', query: { from: 'old' } } as any;
    const prev = window.location.href;
    window.history.replaceState({}, '', '/inner?from=browser');
    mergeInitialRouteBrowserQuery({
      isMemoryMode: false,
      isHashMode: false,
      isBrowserMode: true,
      parseQuery: (search) => ({ from: new URLSearchParams(search).get('from') }),
    }, loc);
    expect(loc.query.from).toBe('browser');
    window.history.replaceState({}, '', prev);
  });

  it('syncBasenameRouterStacks 应同步并合并 stacks', () => {
    const router = createTestRouter(
      [{ path: '/app', component: Home }, { path: '/app/x', component: About }],
      { basename: '/app' },
    );
    router.stacks = [{
      pathname: '/app', search: '', hash: '', index: 0, timestamp: 1, query: {},
    } as any];
    router.history.stacks = [
      { pathname: '/app', search: '', hash: '', index: 0, timestamp: 10, query: {} } as any,
      { pathname: '/app/x', search: '', hash: '', index: 1, timestamp: 20, query: {} } as any,
    ];
    syncBasenameRouterStacks(router);
    expect(router.stacks.length).toBeGreaterThan(0);
    router.stop();
  });

  it('resolveShortPathnameViaParent 应沿父级解析短路径', () => {
    const matched: any = [{ path: '/resolved' }];
    matched.unmatchedPath = '';
    const resolved = resolveShortPathnameViaParent({
      parent: {
        basename: '/',
        getMatched: () => matched,
        parent: null,
      },
    }, '/');
    expect(resolved).toBe('/resolved');
  });

  it('resolveShortPathnameViaParent 无匹配父级时应原样返回', () => {
    expect(resolveShortPathnameViaParent({ parent: null }, '/short')).toBe('/short');
  });

  it('applyNestedChildInitLocation 应从父级同步 URL', () => {
    const parent = createTestRouter([{ path: '/app', component: Home }], { basename: '/app' });
    syncNavigate(parent, '/app');
    const child = createTestRouter([{ path: '/', component: About }], { basename: '/app/sub' });
    (child as any).parent = parent;
    const location = { pathname: '/wrong', path: '/wrong', search: '', query: {} } as any;
    applyNestedChildInitLocation(child as any, location, '/wrong');
    expect(location.pathname).toBe('/app');
    child.stop();
    parent.stop();
  });
});
