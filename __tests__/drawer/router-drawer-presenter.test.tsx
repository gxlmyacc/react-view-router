import React from 'react';
import { config } from '../../src';
import type { RouterViewPresenterProps } from '../../src/router-view';
import Drawer from '../../drawer/src/drawer';
import RouterDrawerPresenter from '../../drawer/src/presenter';

describe('组合式 RouterDrawer 展示层', () => {
  it('公开入口导出 RouterDrawer', () => {
    expect(require('../../drawer/src/index.ts').default).toBeDefined();
  });

  it('公开入口导出 RouterDrawer', () => {
    expect(require('../../drawer/src/index.ts').default).toBeDefined();
  });

  function createPresenter(zIndex?: number | ((...args: any[]) => number)) {
    const back = jest.fn();
    const route = { path: '/parent/details', depth: 1 };
    const view = {
      isNull: (value: unknown) => value == null,
      state: { depth: 1, parentRoute: { path: '/parent' } },
    };
    const router = { currentRoute: { path: route.path }, back };
    const children = React.createElement('div', null, 'details');
    const props = { route, view, router, children } as unknown as RouterViewPresenterProps;
    const presenter = new RouterDrawerPresenter(props);
    (presenter as any).context = {
      prefixCls: 'rvr-route-drawer', position: 'right', touch: false, delay: 400, zIndex,
    };
    return { presenter, back, route, view, router, children };
  }

  it('以 Drawer 包裹子路由，并按路由深度计算层级', () => {
    const { presenter, children } = createPresenter();
    const element = presenter.render() as React.ReactElement;
    expect(element.type).toBe(Drawer);
    expect(element.props.children).toBe(children);
    expect(element.props.open).toBe(true);
    expect(element.props.transitionName).toBe('rvr-slide-right');
    expect(element.props.zIndex).toBe(config.zIndexStart + config.zIndexStep);
  });

  it('支持自定义数值与函数层级', () => {
    const numeric = createPresenter(888).presenter.render() as React.ReactElement;
    expect(numeric.props.zIndex).toBe(888);
    const resolver = jest.fn(() => 1234);
    const { presenter, route, view } = createPresenter(resolver);
    expect((presenter.render() as React.ReactElement).props.zIndex).toBe(1234);
    expect(resolver).toHaveBeenCalledWith(route, { config, view });
  });

  it.each(['right', 'left', 'bottom', 'top'])('传递 %s 方向及最大尺寸，不覆盖默认全尺寸布局', (position) => {
    const { presenter } = createPresenter();
    (presenter as any).context = {
      ...(presenter as any).context, position, maxWidth: 420, maxHeight: '60%', delay: 350,
    };
    const element = presenter.render() as React.ReactElement;
    expect(element.props.position).toBe(position);
    expect(element.props.transitionName).toBe(`rvr-slide-${position}`);
    expect(element.props.style).toEqual({ maxWidth: 420, maxHeight: '60%', animationDuration: '350ms' });
  });

  it('居中面板使用淡入淡出并保留 CSS 尺寸', () => {
    const { presenter } = createPresenter();
    (presenter as any).context = {
      ...(presenter as any).context, position: 'center', maxWidth: '80vw', maxHeight: '70vh',
    };
    const element = presenter.render() as React.ReactElement;
    expect(element.props.transitionName).toBe('rvr-drawer-center');
    expect(element.props.style).toMatchObject({ maxWidth: '80vw', maxHeight: '70vh' });
  });

  it('尺寸与最大尺寸分别传递，支持内容自适应与视口上限', () => {
    const { presenter } = createPresenter();
    (presenter as any).context = {
      ...(presenter as any).context,
      width: 'max-content',
      height: 'max-content',
      maxWidth: '90vw',
      maxHeight: '90vh',
    };
    expect((presenter.render() as React.ReactElement).props.style).toMatchObject({
      width: 'max-content', height: 'max-content', maxWidth: '90vw', maxHeight: '90vh',
    });
  });

  it('关闭抽屉时回退，已在父路由时不再回退', () => {
    const { presenter, back, router } = createPresenter();
    presenter.handleClose();
    expect(back).toHaveBeenCalledTimes(1);
    router.currentRoute.path = '/parent';
    presenter.handleClose();
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('关闭时保留退场内容，重新打开时换成新内容', () => {
    const { presenter, children } = createPresenter();
    const { props } = presenter;
    const closedProps = { ...props, route: null, children: null };
    const closing = RouterDrawerPresenter.getDerivedStateFromProps(closedProps, presenter.state);
    expect(closing).toMatchObject({ open: false, displayed: children });
    const replacement = React.createElement('div', null, 'other');
    const reopening = RouterDrawerPresenter.getDerivedStateFromProps({ ...props, children: replacement }, {
      ...presenter.state, ...closing,
    });
    expect(reopening).toMatchObject({ open: true, displayed: replacement });
    expect(RouterDrawerPresenter.getDerivedStateFromProps({ ...closedProps }, {
      routePath: null, open: false, displayed: children,
    })).toBeNull();
  });

  it('父路由缺失或开合状态未变化时不派发视图事件', () => {
    const { presenter, view } = createPresenter();
    const notify = jest.fn();
    const parent = { _isMounted: true, _notifyViewActivation: notify };
    view.state.parentRoute = { path: '/parent', viewInstances: { default: parent } };
    presenter.state = { ...presenter.state, open: false };
    presenter.componentDidUpdate(presenter.props, { ...presenter.state, open: false });
    expect(notify).not.toHaveBeenCalled();

    view.state.parentRoute = null;
    presenter.state = { ...presenter.state, open: true };
    presenter.componentDidUpdate(presenter.props, { ...presenter.state, open: false });
    expect(notify).not.toHaveBeenCalled();
  });

  it('按父级实例去重并跳过未挂载父视图', () => {
    const { presenter, view } = createPresenter();
    const notify = jest.fn();
    const parent = { _isMounted: true, _notifyViewActivation: notify };
    const unmounted = { _isMounted: false, _notifyViewActivation: jest.fn() };
    view.state.parentRoute = { path: '/parent', viewInstances: { default: parent, extra: unmounted } };
    view.state.parent = parent;
    presenter.state = { ...presenter.state, open: false };
    presenter.componentDidUpdate(presenter.props, { ...presenter.state, open: true });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(unmounted._notifyViewActivation).not.toHaveBeenCalled();
  });

  it('空路由使用起始层级，零深度时回退到视图深度', () => {
    const { presenter, view } = createPresenter();
    const context = (presenter as any).context;
    const empty = presenter.render() as React.ReactElement;
    expect(empty.props.zIndex).toBe(config.zIndexStart + config.zIndexStep);
    (presenter as any).props = { ...presenter.props, route: null };
    const nullRoute = presenter.render() as React.ReactElement;
    expect(nullRoute.props.zIndex).toBe(config.zIndexStart);
    (presenter as any).props = { ...presenter.props, route: { path: '/parent/details', depth: 0 } };
    expect((presenter.render() as React.ReactElement).props.zIndex).toBe(config.zIndexStart + view.state.depth * config.zIndexStep);
    (presenter as any).context = context;
  });

  it('空 route path 与无 position 时保留关闭状态且不添加动画名', () => {
    const { presenter, view, children } = createPresenter();
    (presenter as any).props = { ...presenter.props, route: { path: '' } };
    view.isNull = () => false;
    const updated = RouterDrawerPresenter.getDerivedStateFromProps(presenter.props, {
      routePath: null, open: false, displayed: children,
    });
    expect(updated).toBeNull();
    (presenter as any).context = { ...(presenter as any).context, position: undefined };
    expect((presenter.render() as React.ReactElement).props.transitionName).toBe('');
  });

  it('只有抽屉已关闭时退场回调才清除内容', () => {
    const { presenter, children } = createPresenter();
    const setState = jest.fn();
    presenter.setState = setState;
    presenter.handleLeave();
    expect(setState).not.toHaveBeenCalled();
    presenter.state = { ...presenter.state, open: false };
    presenter.handleLeave();
    expect(setState).toHaveBeenCalledWith({ displayed: null });
    expect(children).toBeTruthy();
  });
});
