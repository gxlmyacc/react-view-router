import React from 'react';
import { RouterViewComponent } from '../../src/router-view';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';
import { normalizeRoutes } from '../../src/util';

describe('RouterView 类方法深度覆盖', () => {
  /**
   * 创建未挂载的 RouterView 实例。
   * @param props 组件 props
   */
  function createView(props: Record<string, any> = {}) {
    const router = createTestRouter(props.routes);
    delete props.routes;
    const view = new (RouterViewComponent as any)({ router, ...props });
    return { view, router };
  }

  it('_resolveFallback 函数形式应调用', () => {
    const fallback = jest.fn(() => React.createElement('span', null, 'fb'));
    const { view, router } = createView({ fallback });
    view.state = { ...view.state, inited: false, resolving: true };
    const ret = view._resolveFallback();
    expect(fallback).toHaveBeenCalled();
    expect(ret).toBeTruthy();
    router.stop();
  });

  it('shouldComponentUpdate resolving 变化应更新', () => {
    const { view, router } = createView();
    view._isMounted = true;
    view.state = { ...view.state, resolving: false };
    const next = { ...view.state, resolving: true };
    expect(view.shouldComponentUpdate(view.props, next)).toBe(true);
    router.stop();
  });

  it('shouldComponentUpdate keepAlive 函数 props 应忽略', () => {
    const fn1 = () => true;
    const fn2 = () => true;
    const { view, router } = createView({ keepAlive: fn1 });
    view._isMounted = true;
    const nextProps = { ...view.props, keepAlive: fn2 };
    expect(view.shouldComponentUpdate(nextProps, view.state)).toBe(false);
    router.stop();
  });

  it('componentWillUnmount 应清理 viewRoot', () => {
    const { view, router } = createView();
    view.state = { ...view.state, _routerRoot: true, router };
    router.viewRoot = view;
    view.componentWillUnmount();
    expect(router.viewRoot).toBeNull();
    router.stop();
  });

  it('getComponentProps filter 应生效', () => {
    const filter = (routes: any[]) => routes.filter(r => r.path !== '/about');
    const { view, router } = createView({ filter });
    syncNavigate(router, '/');
    view.state.routes = view._filterRoutes(router.routes);
    expect(view.state.routes.every((r: any) => r.path !== '/about')).toBe(true);
    router.stop();
  });

  it('isActivate 无 parent 时应为 true', () => {
    const { view, router } = createView();
    expect(view.isActivate).toBe(true);
    router.stop();
  });
});
