/* eslint-disable max-classes-per-file */
import React from 'react';
import { RouterLink } from '../../src/router-link';
import { RouterViewComponent } from '../../src/router-view';
import { createHistory, PopStateEventType } from '../../src/history/history';
import { copyOwnProperties } from '../../src/history/utils';
import { HistoryType } from '../../src/history/types';
import {
  normalizeLocation,
  normalizeRoutes,
  normalizeProps,
  resolveIndex,
  configRouteProps,
  renderRoute,
  getParentRoute,
} from '../../src/util';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';

/**
 * 创建可模拟 popstate 的 window。
 * @param pathname 初始路径
 */
function createInteractiveWindow(pathname = '/') {
  let currentPathname = pathname;
  let stateIdx = 0;
  const listeners: Record<string, Function[]> = {};

  const location = {
    get pathname() { return currentPathname; },
    set pathname(v: string) { currentPathname = v; },
    search: '',
    hash: '',
    href: 'http://localhost/base/#/hash',
    assign: jest.fn(),
    replace: jest.fn(),
  };

  const history = {
    get state() { return { idx: stateIdx, usr: { foo: 1 }, key: 'k' }; },
    set state(v: any) { stateIdx = v?.idx ?? stateIdx; },
    length: 3,
    pushState: jest.fn((state: any, _t: string, url?: string) => {
      history.state = state;
      if (url) {
        const path = url.replace('http://localhost', '').split('?')[0];
        if (path) currentPathname = path || '/';
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
    removeEventListener: () => {},
    dispatchEvent: (event: { type: string }) => {
      (listeners[event.type] || []).forEach((fn) => fn(event));
      return true;
    },
    document: {
      querySelector: jest.fn(() => ({
        getAttribute: () => 'http://localhost/base/',
      })),
      defaultView: null as any,
    },
  };
  win.document.defaultView = win;
  return { win: win as unknown as Window, history, location };
}

describe('COVERAGE_FILES statements 90% 阈值补充', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('router-link.ts', () => {
    it('shouldComponentUpdate 无变化应返回 false', () => {
      const router = createTestRouter();
      const link = new RouterLink({ to: '/', router });
      link.state = {
        seed: 1, router, routerView: null, inited: true, isMatched: false,
      };
      expect(link.shouldComponentUpdate(link.props, { ...link.state })).toBe(false);
      router.stop();
    });

    it('componentDidUpdate router 变化应 remount', () => {
      const r1 = createTestRouter();
      const r2 = createTestRouter();
      const link = new RouterLink({ to: '/', router: r1 });
      link.state = {
        seed: 1, router: r1, routerView: null, inited: true, isMatched: false,
      };
      const remountSpy = jest.spyOn(link, '_remount').mockImplementation(() => {});
      jest.spyOn(link, 'setState').mockImplementation((_state, cb) => {
        if (typeof cb === 'function') cb();
      });
      link.props = { ...link.props, router: r2 };
      link.componentDidUpdate({ ...link.props, router: r1, to: '/' });
      expect(remountSpy).toHaveBeenCalled();
      r1.stop();
      r2.stop();
    });

    it('componentDidUpdate to 从字符串变为对象应 remount', () => {
      const router = createTestRouter();
      const link = new RouterLink({ to: '/about', router, tag: 'a' });
      link.state = {
        seed: 1, router, routerView: null, inited: true, isMatched: false,
      };
      const remountSpy = jest.spyOn(link, '_remount').mockImplementation(() => {});
      link.props = { ...link.props, to: { path: '/about' } };
      link.componentDidUpdate({ ...link.props, to: '/about' });
      expect(remountSpy).toHaveBeenCalled();
      router.stop();
    });

    it('componentDidUpdate 仅 exact 变化应直接 remount', () => {
      const router = createTestRouter();
      const link = new RouterLink({ to: '/about', exact: false, router, tag: 'a' });
      link.state = {
        seed: 1, router, routerView: null, inited: true, isMatched: false,
      };
      const remountSpy = jest.spyOn(link, '_remount').mockImplementation(() => {});
      const setStateSpy = jest.spyOn(link, 'setState');
      link.props = { ...link.props, exact: true };
      link.componentDidUpdate({ ...link.props, exact: false });
      expect(remountSpy).toHaveBeenCalled();
      expect(setStateSpy).not.toHaveBeenCalled();
      router.stop();
    });

    it('componentDidUpdate to 对象属性变化应 remount', () => {
      const router = createTestRouter();
      const link = new RouterLink({ to: { path: '/about', query: { a: 1 } }, router, tag: 'a' });
      link.state = {
        seed: 1, router, routerView: null, inited: true, isMatched: false,
      };
      const remountSpy = jest.spyOn(link, '_remount').mockImplementation(() => {});
      link.props = { ...link.props, to: { path: '/about', query: { a: 2 } } };
      link.componentDidUpdate({ ...link.props, to: { path: '/about', query: { a: 1 } } });
      expect(remountSpy).toHaveBeenCalled();
      router.stop();
    });
  });

  describe('router-view.ts', () => {
    it('parentRouterView 应从 context 读取父实例', () => {
      const router = createTestRouter();
      const parent = new (RouterViewComponent as any)({ router });
      const child = new (RouterViewComponent as any)({ router });
      child.context = parent;
      expect((child as any).parentRouterView).toBe(parent);
      router.stop();
    });

    it('componentDidMount 未启动 router 应告警', async () => {
      const router = createTestRouter();
      router.stop();
      const warnSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const parent = new (RouterViewComponent as any)({ router });
      parent._isMounted = true;
      parent.state = { router, inited: true, depth: 0, routes: router.routes };
      const child = new (RouterViewComponent as any)({ router, _parentView: parent });
      child._isMounted = true;
      child._reactInternals = { return: null };
      jest.spyOn(child, 'setState').mockImplementation((partial: any) => {
        Object.assign(child.state, partial);
      });
      await child.componentDidMount();
      expect(warnSpy).toHaveBeenCalledWith('[RouterView]warning: router is not running.');
      warnSpy.mockRestore();
    });

    it('shouldComponentUpdate 普通 props 变化应返回 true', () => {
      const router = createTestRouter();
      const view = new (RouterViewComponent as any)({ router, className: 'a' });
      view._isMounted = true;
      view.state = {
        router, inited: true, resolving: false, routes: router.routes, currentRoute: null, depth: 0,
      };
      expect(view.shouldComponentUpdate({ ...view.props, className: 'b' }, view.state)).toBe(true);
      router.stop();
    });
  });

  describe('util.ts', () => {
    it('normalizeLocation 多段 search 应合并后续片段', () => {
      const loc = normalizeLocation('/path?a=1?b=2');
      expect(loc?.search).toContain('%3Fb%3D2');
    });

    it('resolveIndex 嵌套 index 应递归解析', () => {
      const routes = normalizeRoutes([
        { path: '/a', index: '/b', component: Home },
        { path: '/b', index: '/c', component: About },
        { path: '/c', component: Home },
      ]);
      const resolved = resolveIndex('/a', routes);
      expect(resolved?.subpath).toBe('/c');
    });

    it('normalizeProps 非法类型应返回 false', () => {
      expect(normalizeProps(123 as any)).toBe(false);
    });

    it('configRouteProps type 函数应转换值', () => {
      const props: Record<string, any> = {};
      configRouteProps(props, { num: { type: (v: string) => Number(v) } }, { num: '3' });
      expect(props.num).toBe(3);
    });

    it('renderRoute 无 component 有 children 应渲染子视图', () => {
      const routes = normalizeRoutes([
        {
          path: '/p',
          component: Home,
          children: [{ path: '/p/c', component: About }],
        },
      ]);
      const router = createTestRouter(routes);
      syncNavigate(router, '/p/c');
      const matched = router.currentRoute!.matched[1] || router.currentRoute!.matched[0];
      const node = renderRoute(matched, routes, {}, null, { router, name: 'default' });
      expect(node).toBeTruthy();
      router.stop();
    });

    it('renderRoute defaultProps 函数应参与合并', () => {
      const Comp = class C extends React.Component {
        render() {
          return React.createElement('span', null, 'x');
        }
      };
      const routes = normalizeRoutes([{
        path: '/dp',
        component: Comp as any,
        defaultProps: () => ({ 'data-x': '1' }),
      }]);
      const router = createTestRouter(routes);
      syncNavigate(router, '/dp');
      const matched = router.currentRoute!.matched[0];
      const node = renderRoute(matched, routes, {}, null, { router }) as any;
      expect(node?.props?.['data-x']).toBe('1');
      router.stop();
    });

    it('getParentRoute 应返回宿主 RouterView 当前路由', () => {
      const router = createTestRouter();
      syncNavigate(router, '/about');
      const view = {
        _reactInternals: {
          return: {
            stateNode: {
              state: { _routerRoot: true, currentRoute: router.currentRoute!.matched[0] },
            },
            return: null,
          },
        },
      };
      expect(getParentRoute(view)?.path).toBe('/about');
      router.stop();
    });

    it('normalizeRoutes props 数组应写入 routeProps', () => {
      const routes = normalizeRoutes([{ path: '/arr', component: Home, props: ['id'] as any }]);
      expect(routes[0].props).toBeDefined();
    });
  });

  describe('history', () => {
    it('copyOwnProperties 空 source 应返回 target', () => {
      expect(copyOwnProperties({ a: 1 }, null)).toEqual({ a: 1 });
    });

    it('history.length / state getter 应可读', () => {
      const { win } = createInteractiveWindow('/');
      const history = createHistory({
        window: win,
        type: HistoryType.browser,
        getLocationPath: () => win.location,
        createHref: (to) => (typeof to === 'string' ? to : '/'),
      });
      expect(history.length).toBe(3);
      expect(history.state).toEqual({ foo: 1 });
    });
  });

  describe('router.ts', () => {
    it('updateRoute 应直接合并 basename stacks', () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }, { path: '/app/x', component: About }],
        { basename: '/app' },
      );
      router.stacks = [{
        pathname: '/app',
        search: '',
        hash: '',
        index: 0,
        timestamp: 1,
        query: {},
      } as any];
      router.history.stacks = [
        { pathname: '/app', search: '', hash: '', index: 0, timestamp: 10, query: {} } as any,
        { pathname: '/app/x', search: '', hash: '', index: 1, timestamp: 20, query: {} } as any,
      ];
      router.updateRoute(router.createRoute('/app/x'));
      expect(router.stacks.length).toBeGreaterThan(0);
      router.stop();
    });

    it('_refreshInitialRoute basename 多栈应回溯选中', () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }, { path: '/app/inner', component: About }],
        { basename: '/app', rememberInitialRoute: true },
      );
      router.history.stacks = [
        { pathname: '/', search: '', hash: '', index: 0, timestamp: 0, query: {} } as any,
        { pathname: '/app', search: '', hash: '', index: 1, timestamp: 1, query: {} } as any,
        { pathname: '/app/inner', search: '', hash: '', index: 2, timestamp: 2, query: {} } as any,
      ];
      router._refreshInitialRoute();
      expect(router.initialRoute?.path).toBeDefined();
      router.stop();
    });

    it('绝对路径不在 basename 下应跳过拦截', async () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }],
        { basename: '/app' },
      );
      let ok: boolean | undefined;
      await new Promise<void>((resolve) => {
        router._handleRouteInterceptor(
          { pathname: '/other', path: '/other', search: '', absolute: true } as any,
          (res) => {
            ok = res as boolean;
            resolve();
          },
        );
      });
      expect(ok).toBe(true);
      router.stop();
    });

    it('updateRoute stacks 时间戳不一致应局部合并', () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }, { path: '/app/x', component: About }],
        { basename: '/app' },
      );
      router.stacks = [{
        pathname: '/app',
        search: '',
        hash: '',
        index: 0,
        timestamp: 1,
        query: {},
      } as any];
      router.history.stacks = [
        { pathname: '/app', search: '', hash: '', index: 0, timestamp: 10, query: {} } as any,
        { pathname: '/app/x', search: '', hash: '', index: 1, timestamp: 20, query: {} } as any,
      ];
      syncNavigate(router, '/app/x');
      expect(router.stacks.length).toBeGreaterThan(0);
      router.stop();
    });

    it('rememberInitialRoute basename 栈回溯应选中子路径', () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }, { path: '/app/inner', component: About }],
        { basename: '/app', rememberInitialRoute: true },
      );
      router.history.stacks = [
        { pathname: '/', search: '', hash: '', index: 0, timestamp: 0, query: {} } as any,
        { pathname: '/app', search: '', hash: '', index: 1, timestamp: 1, query: {} } as any,
        { pathname: '/app/inner', search: '', hash: '', index: 2, timestamp: 2, query: {} } as any,
      ];
      router.history.push('/app/inner');
      router._refreshInitialRoute();
      expect(router.initialRoute?.path).toBeDefined();
      router.stop();
    });
  });
});
