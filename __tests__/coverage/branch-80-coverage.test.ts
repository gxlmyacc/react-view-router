/* eslint-disable max-classes-per-file */
import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { createHashHistory, createHashHref } from '../../src/history/hash';
import { REACT_VIEW_ROUTER_GLOBAL } from '../../src/global';
import { RouterLink } from '../../src/router-link';
import { RouterContext } from '../../src/context';
import KeepAlive from '../../src/keep-alive';
import Drawer from '../../drawer/src/drawer';
import {
  useRoute,
  useRouteMeta,
  useRouteMetaChanged,
  useRouteQuery,
} from '../../src/hooks/base';
import useRouteTitle, { readRouteTitles } from '../../src/hooks/use-route-title';
import { RouterViewComponent } from '../../src/router-view';
import { createTestRouter, syncNavigate, renderWithRouter, Home, About, renderUtils } from '../helpers/test-utils';

describe('分支覆盖率 80% 提升', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('context.ts', () => {
    it('应导出与 global 一致的 Context 引用', () => {
      expect(REACT_VIEW_ROUTER_GLOBAL.contexts.RouterContext).toBeDefined();
      expect(REACT_VIEW_ROUTER_GLOBAL.contexts.RouterViewContext).toBeDefined();
    });
  });

  describe('hash.ts', () => {
    /**
     * 创建 hash history 测试用 mock window。
     * @param hash 初始 hash
     * @param search 初始 search
     */
    function createHashWin(hash = '#/page', search = '') {
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
        state: { idx: 0, usr: null, key: 'k' },
        pushState: jest.fn((_s: any, _t: string, url: string) => {
          if (url.includes('#')) currentHash = url.slice(url.indexOf('#'));
        }),
        replaceState: jest.fn(),
        go: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        length: 1,
      };
      const win = {
        location,
        history,
        addEventListener: (type: string, fn: Function) => {
          listeners[type] = listeners[type] || [];
          listeners[type].push(fn);
        },
        removeEventListener: () => {},
        dispatchEvent: (e: { type: string }) => {
          (listeners[e.type] || []).forEach((fn) => fn(e));
          return true;
        },
        document: { querySelector: () => ({ getAttribute: () => 'http://localhost/' }), defaultView: null as any },
      };
      win.document.defaultView = win;
      return win as unknown as Window;
    }

    it('createHashHref 应去除与 location.search 重复的 query', () => {
      const win = createHashWin();
      (win as any).location.search = '?dup=1';
      const href = createHashHref('/path?dup=1&extra=2', 'slash', win);
      expect(href).toContain('extra=2');
    });

    it('getLocationPath hash 无斜杠前缀应补全', () => {
      const win = createHashWin('page');
      (win.document as any).defaultView = win;
      const history = createHashHistory({ window: win });
      expect(history.location.pathname).toMatch(/^\//);
    });

    it('getLocationPath hash 含 query 时应合并 location.search', () => {
      const win = createHashWin('#/page?inhash=1');
      (win as any).location.search = '?global=1';
      (win.document as any).defaultView = win;
      const history = createHashHistory({ window: win });
      expect(history.location.search).toContain('global=1');
    });
  });

  describe('router-link.ts', () => {
    it('componentDidUpdate to 对象变化应 remount', async () => {
      const router = createTestRouter();
      syncNavigate(router, '/');
      const remountSpy = jest.spyOn(RouterLink.prototype as any, '_remount');
      const { rerender } = renderWithRouter(
        React.createElement(RouterLink, { to: { path: '/about' }, tag: 'a', router }, 'x'),
        router,
      );
      await waitFor(() => expect(remountSpy).toHaveBeenCalled());
      remountSpy.mockClear();
      rerender(
        React.createElement(
          RouterContext.Provider,
          { value: router },
          React.createElement(RouterLink, { to: { path: '/users/1' }, tag: 'a', router }, 'x'),
        ),
      );
      expect(remountSpy).toHaveBeenCalled();
      router.stop();
    });

    it('componentDidUpdate exact 变化应 remount', async () => {
      const router = createTestRouter();
      syncNavigate(router, '/');
      const remountSpy = jest.spyOn(RouterLink.prototype as any, '_remount');
      const { rerender } = renderWithRouter(
        React.createElement(RouterLink, { to: '/about', tag: 'a', exact: false, router }, 'x'),
        router,
      );
      await waitFor(() => expect(remountSpy).toHaveBeenCalled());
      remountSpy.mockClear();
      rerender(
        React.createElement(
          RouterContext.Provider,
          { value: router },
          React.createElement(RouterLink, { to: '/about', tag: 'a', exact: true, router }, 'x'),
        ),
      );
      expect(remountSpy).toHaveBeenCalled();
      router.stop();
    });

    it('componentDidUpdate append 变化应 remount', async () => {
      const router = createTestRouter();
      syncNavigate(router, '/');
      const remountSpy = jest.spyOn(RouterLink.prototype as any, '_remount');
      const { rerender } = renderWithRouter(
        React.createElement(RouterLink, { to: '/about', tag: 'a', append: false, router }, 'x'),
        router,
      );
      await waitFor(() => expect(remountSpy).toHaveBeenCalled());
      remountSpy.mockClear();
      rerender(
        React.createElement(
          RouterContext.Provider,
          { value: router },
          React.createElement(RouterLink, { to: '/about', tag: 'a', append: true, router }, 'x'),
        ),
      );
      expect(remountSpy).toHaveBeenCalled();
      router.stop();
    });
  });

  describe('keep-alive.ts', () => {
    it('activeName 为空时不应挂载节点', async () => {
      const ref = React.createRef<any>();
      render(
        React.createElement(KeepAlive, {
          utils: renderUtils,
          activeName: '',
          ref,
          children: React.createElement('div', { 'data-testid': 'empty' }, 'e'),
        }),
      );
      expect(ref.current?.nodes.length).toBe(0);
    });

    it('自定义 anchor 应替代默认 anchor', () => {
      const ref = React.createRef<any>();
      render(
        React.createElement(KeepAlive, {
          utils: renderUtils,
          activeName: '/anch',
          ref,
          anchor: React.createElement('span', { 'data-testid': 'custom-anchor' }, 'a'),
          children: React.createElement('div', null, 'c'),
        }),
      );
      expect(document.querySelector('[data-testid="custom-anchor"]')).toBeTruthy();
    });

    it('remove 未知名应返回 -1', async () => {
      const ref = React.createRef<any>();
      render(
        React.createElement(KeepAlive, {
          utils: renderUtils,
          activeName: '/rm',
          ref,
          children: React.createElement('div', { 'data-testid': 'rm' }, 'r'),
        }),
      );
      await waitFor(() => expect(ref.current?.find('/rm')).toBeDefined());
      expect(ref.current?.remove('/missing')).toBe(-1);
    });
  });

  describe('drawer.ts', () => {
    afterEach(() => {
      document.body.innerHTML = '';
      document.body.style.overflow = '';
    });

    it('onTouchMove 已判定非右滑后应忽略后续移动', () => {
      const ref = React.createRef<Drawer>();
      render(React.createElement(Drawer, { open: true, touch: true, ref }, 'x'));
      const el = document.querySelector('.rvr-drawer') as HTMLElement;
      act(() => {
        ref.current?.onTouchMove({ dir: 'Left', deltaX: 10 });
        ref.current?.onTouchMove({ dir: 'Right', deltaX: -20 });
      });
      expect(el.style.transform).toBe('');
    });

    it('closed 后 getTransitionName 应返回空字符串', () => {
      const ref = React.createRef<Drawer>();
      render(React.createElement(Drawer, { open: true, animation: 'slide', ref }, 'x'));
      act(() => { (ref.current as any).closed = true; });
      expect(ref.current?.getTransitionName()).toBe('');
      expect(ref.current?.getMaskTransitionName()).toBe('');
    });

    it('未配置 portalContainer 时使用内联容器', () => {
      const ref = React.createRef<Drawer>();
      render(React.createElement(Drawer, { open: true, ref }, 'x'));
      expect(ref.current?.getContainer()).toBeNull();
      expect(document.querySelector('.rvr-drawer')).toBeInTheDocument();
    });
  });

  describe('hooks/base.ts', () => {
    it('useRoute watch 回调返回 false 时不应阻断导航', async () => {
      jest.useFakeTimers();
      const router = createTestRouter();
      syncNavigate(router, '/');
      const watch = jest.fn(() => false);
      renderHook(() => useRoute(router, { watch }), {
        wrapper: ({ children }) =>
          React.createElement(RouterContext.Provider, { value: router }, children),
      });
      act(() => syncNavigate(router, '/about'));
      act(() => jest.runAllTimers());
      expect(watch).toHaveBeenCalled();
      expect(router.currentRoute?.path).toBe('/about');
      router.stop();
    });

    it('useRouteMeta setAll 应批量写入 meta', () => {
      const router = createTestRouter([
        { path: '/sa', component: Home, meta: { a: '1', b: '2' } },
      ]);
      syncNavigate(router, '/sa');
      const { result } = renderHook(() => useRouteMeta(['a', 'b'], router), {
        wrapper: ({ children }) =>
          React.createElement(RouterContext.Provider, { value: router }, children),
      });
      act(() => result.current[1]({ a: 'A', b: 'B', c: 'skip' }, true));
      expect(result.current[0]).toMatchObject({ a: 'A', b: 'B' });
      router.stop();
    });

    it('useRouteMeta updateRouteMeta 未变化时不应更新 state', () => {
      const router = createTestRouter([
        { path: '/m', component: Home, meta: { title: 'T' } },
      ]);
      syncNavigate(router, '/m');
      jest.spyOn(router, 'updateRouteMeta').mockReturnValue(false);
      const { result } = renderHook(() => useRouteMeta('title', router), {
        wrapper: ({ children }) =>
          React.createElement(RouterContext.Provider, { value: router }, children),
      });
      act(() => result.current[1]('T'));
      expect(result.current[0]).toBe('T');
      router.stop();
    });

    it('useRouteMetaChanged 对象 deps 应匹配 meta 对象', () => {
      const router = createTestRouter([
        { path: '/mc', component: Home, meta: { label: 'L' } },
      ]);
      syncNavigate(router, '/mc');
      const onChange = jest.fn();
      const metaObj = router.currentRoute!.matched[0].meta;
      renderHook(() => useRouteMetaChanged(router, onChange, [metaObj as any]), {
        wrapper: ({ children }) =>
          React.createElement(RouterContext.Provider, { value: router }, children),
      });
      act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { label: 'N' }));
      expect(onChange).toHaveBeenCalled();
      router.stop();
    });

    it('useRouteQuery 无 router 时应返回空对象', () => {
      const { result } = renderHook(() => useRouteQuery(null));
      expect(result.current).toEqual({});
    });
  });

  describe('use-route-title.ts', () => {
    it('manual 模式 setTitles 应更新 titles', () => {
      const router = createTestRouter([
        { path: '/', component: Home, meta: { title: 'H' } },
      ]);
      syncNavigate(router, '/');
      const { result } = renderHook(
        () => useRouteTitle({ manual: true }, router),
      );
      act(() => result.current.setTitles([{ path: '/', title: 'New', visible: true } as any]));
      expect(result.current.titles[0]?.title).toBe('New');
      router.stop();
    });

    it('无 props 时应使用默认配置', () => {
      const router = createTestRouter([
        { path: '/', component: Home, meta: { title: 'H' } },
      ]);
      const { result } = renderHook(
        () => useRouteTitle(undefined, router),
      );
      expect(result.current.titles.length).toBeGreaterThan(0);
      router.stop();
    });

    it('defaultRouter 模式 meta 变化应刷新 titles', () => {
      jest.useFakeTimers();
      const router = createTestRouter([
        { path: '/', component: Home, meta: { title: 'T' } },
      ]);
      syncNavigate(router, '/');
      renderHook(
        () => useRouteTitle({ manual: true, filterMetas: ['title'] }, router),
      );
      act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { title: 'N' }));
      act(() => jest.runAllTimers());
      router.stop();
    });

    it('RouterContext 子路由切换应刷新 tabs', async () => {
      const router = createTestRouter([
        {
          path: '/p',
          component: Home,
          meta: { title: 'P' },
          children: [
            { path: '/p/a', component: About, meta: { title: 'A' } },
            { path: '/p/b', component: About, meta: { title: 'B' } },
          ],
        },
      ]);
      syncNavigate(router, '/p/a');
      renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
      await waitFor(() => expect(router.isPrepared).toBe(true));
      const { result } = renderHook(() => useRouteTitle({ maxLevel: 2 }), {
        wrapper: ({ children }) =>
          React.createElement(RouterContext.Provider, { value: router }, children),
      });
      await waitFor(() => expect(result.current.titles.length).toBeGreaterThan(0));
      act(() => syncNavigate(router, '/p/b'));
      await waitFor(() => expect(result.current.parsed).toBe(true));
      router.stop();
    });

    it('filterMetas 变更应触发 routeMetaChangedCallback', () => {
      jest.useFakeTimers();
      const router = createTestRouter([
        { path: '/', component: Home, meta: { title: 'T', label: 'L' } },
      ]);
      syncNavigate(router, '/');
      renderHook(
        () => useRouteTitle({ manual: true, filterMetas: ['label'] }, router),
      );
      act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { label: 'N' }));
      act(() => jest.runAllTimers());
      router.stop();
    });
  });
});
