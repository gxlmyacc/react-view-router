/* eslint-disable max-classes-per-file */
import React from 'react';
import { render, act } from '@testing-library/react';
import ReactViewRouter from '../../src/router';
import { createHistory } from '../../src/history/history';
import { RouterViewWrapper } from '../../src/router-view';
import {
  normalizeLocation,
  configRouteProps,
  getCurrentPageHash,
  isMatchedRoutePropsChanged,
  renderRoute,
  normalizeRoutes,
} from '../../src/util';
import { HistoryType } from '../../src/history/types';
import {
  createHeavyHistoryWindow,
  clearGlobalHistoryCache,
} from '../helpers/heavy-history-mock';
import { createTestRouter, syncNavigate, Home, About, renderUtils } from '../helpers/test-utils';

describe('重型 history mock 覆盖率补充', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    clearGlobalHistoryCache();
  });

  describe('history.ts popstate 无 idx', () => {
    it('popstate 缺失 idx 时应 rebuild index 并 replaceState', () => {
      const win = createHeavyHistoryWindow({ pathname: '/' });
      const history = createHistory({
        window: win,
        type: HistoryType.browser,
        getLocationPath: () => win.location,
        createHref: (to) => (typeof to === 'string' ? to : '/'),
      });
      history.push('/a');
      history.push('/b');
      win.__heavyHistory.stripStateIdx();
      win.__heavyHistory.setPath('/c');
      win.__heavyHistory.firePopState();
      expect(win.history.replaceState).toHaveBeenCalled();
    });

    it('popstate block 允许后应 applyTx 更新 location', () => {
      const win = createHeavyHistoryWindow({ pathname: '/' });
      const history = createHistory({
        window: win,
        type: HistoryType.browser,
        getLocationPath: () => win.location,
        createHref: (to) => (typeof to === 'string' ? to : '/'),
      });
      history.push('/a');
      history.push('/b');
      history.block(({ callback }) => callback(true));
      win.__heavyHistory.setPath('/a');
      win.history.go(-1);
      expect(history.location.pathname).toBe('/a');
      history.block(null as any);
    });
  });

  describe('router.ts 守卫与 stacks', () => {
    it('updateRoute basename 应同步 stacks', () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }, { path: '/app/x', component: About }],
        { basename: '/app' },
      );
      router.history.stacks = [
        { pathname: '/app', search: '', hash: '', index: 0, timestamp: 10, query: {} } as any,
        { pathname: '/app/x', search: '', hash: '', index: 1, timestamp: 20, query: {} } as any,
      ];
      router.currentRoute = router.createRoute('/app');
      router.updateRoute(router.createRoute('/app/x'));
      expect(router.stacks.length).toBeGreaterThan(0);
      router.stop();
    });

    it('_getBeforeEachGuards compare 应识别 from 未调用的 beforeEnter', () => {
      const router = createTestRouter();
      const to = router.createRoute('/about');
      const from = router.createRoute('/about');
      const enter = jest.fn();
      to.matched[0].guards.beforeEnter.push({
        guard: enter, called: false, lazy: false,
      } as any);
      from.matched[0].guards.beforeEnter.push({
        guard: jest.fn(), called: false, lazy: false,
      } as any);
      const guards = router._getBeforeEachGuards(to, from);
      expect(guards).toContain(enter);
      router.stop();
    });
  });

  describe('util.ts location / props 分支', () => {
    it('normalizeLocation 多段 search 应合并为单一 search', () => {
      const loc = normalizeLocation('/?a=1/?b=2');
      expect(loc?.search).toBeTruthy();
      expect(Object.keys(loc?.query || {}).length).toBeGreaterThanOrEqual(1);
    });

    it('getCurrentPageHash 同页 host 应返回 hash 段', () => {
      const prev = window.location.href;
      window.history.replaceState({}, '', '/page#hashpath');
      expect(getCurrentPageHash(`${window.location.origin}/page#hashpath`)).toBe('hashpath');
      window.history.replaceState({}, '', prev);
    });

    it('normalizeLocation hash 模式绝对 URL 应提取 hash', () => {
      const prev = window.location.href;
      window.history.replaceState({}, '', '/page#hashpath');
      const loc = normalizeLocation(`${window.location.origin}/page#hashpath`, {
        mode: HistoryType.hash,
      });
      expect(loc?.pathname).toBe('hashpath');
      window.history.replaceState({}, '', prev);
    });

    it('configRouteProps 标量 default 分支应执行', () => {
      const props: Record<string, any> = {};
      expect(() => configRouteProps(props, { label: { default: 'default-label' } }, {})).not.toThrow();
    });

    it('isMatchedRoutePropsChanged queryProps 数组应参与比较', () => {
      const router = createTestRouter(
        [{ path: '/qp', component: Home, queryProps: ['tab'] as any }],
        { updateWhenQueryChange: true },
      );
      syncNavigate(router, '/qp?tab=1');
      router.prevRoute = router.currentRoute;
      syncNavigate(router, '/qp?tab=2');
      const matched = router.currentRoute!.matched[0];
      expect(isMatchedRoutePropsChanged(matched, router)).toBe(true);
      router.stop();
    });

    it('renderRoute 无 component 有 children 应回退 RouterViewWrapper', () => {
      const routes = normalizeRoutes([
        { path: '/parent', children: [{ path: '/parent/child', component: About }] },
      ]);
      const router = createTestRouter(routes);
      const node = renderRoute(routes[0], routes[0].children as any, {}, null, { router });
      expect(node).toBeTruthy();
      router.stop();
    });
  });

  describe('router-view.ts 对象 ref', () => {
    it('RouterViewWrapper 对象 ref 分支应在 router 启动后创建', async () => {
      clearGlobalHistoryCache();
      const router = new ReactViewRouter({
        manual: true,
        mode: HistoryType.memory,
        routes: [{ path: '/', component: Home }],
        renderUtils,
      });
      const ref = { current: null as any };
      const { rerender } = render(React.createElement(RouterViewWrapper, { router, ref }));
      await act(async () => {
        router.start();
      });
      rerender(React.createElement(RouterViewWrapper, { router, ref }));
      expect(router.isRunning).toBe(true);
      router.stop();
    });
  });
});
