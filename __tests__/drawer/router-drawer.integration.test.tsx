import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RouterView from '../../src/router-view';
import { useViewActivate, useViewDeactivate } from '../../src';
import RouterDrawer from '../../drawer/src/index';
import type { RouterDrawerProps } from '../../drawer/src/RouterDrawer';
import { createTestRouter, syncNavigate } from '../helpers/test-utils';

describe('RouterDrawer 路由集成基线', () => {
  const lifecycle = {
    willUnactivate: jest.fn(),
    didActivate: jest.fn(),
  };

  const parentHooks = { activate: jest.fn(), deactivate: jest.fn() };
  const childHooks = { activate: jest.fn(), deactivate: jest.fn() };

  const Details = React.forwardRef<HTMLElement>((_props, ref) => {
    useViewActivate(childHooks.activate);
    useViewDeactivate(childHooks.deactivate);
    return React.createElement('section', { 'data-testid': 'details', ref }, 'Details');
  });

  function setup(portalContainer?: () => HTMLElement | null, keepAlive = false, options: Partial<RouterDrawerProps> = {}) {
    const drawerRef = React.createRef<unknown>();

    class Workspace extends React.Component {

      componentWillUnactivate() {
        lifecycle.willUnactivate();
      }

      componentDidActivate() {
        lifecycle.didActivate();
      }

      render() {
        return React.createElement(
          'main',
          { 'data-testid': 'workspace' },
          'Workspace',
          React.createElement(RouterDrawer, {
            ref: drawerRef,
            touch: false,
            portalContainer,
            ...options,
          })
        );
      }

    }
    const WorkspaceWithHooks = React.forwardRef<Workspace>((_props, ref) => {
      useViewActivate(parentHooks.activate);
      useViewDeactivate(parentHooks.deactivate);
      return React.createElement(Workspace, { ref });
    });
    const router = createTestRouter([
      {
        path: '/workspace',
        component: WorkspaceWithHooks,
        children: [
          { path: '/details', component: Details, keepAlive },
          { path: '/other', component: () => React.createElement('section', { 'data-testid': 'other' }, 'Other') },
        ]
      },
    ]);
    syncNavigate(router, '/workspace');
    const result = render(React.createElement(RouterView, { router }));
    return { router, drawerRef, ...result };
  }

  beforeEach(() => {
    lifecycle.willUnactivate.mockClear();
    lifecycle.didActivate.mockClear();
    Object.values(parentHooks).forEach((callback) => callback.mockClear());
    Object.values(childHooks).forEach((callback) => callback.mockClear());
  });

  it.each(['right', 'left', 'bottom', 'top'] as const)('支持 %s 方向和无遮罩定位', async (position) => {
    const { router, container, unmount } = setup(undefined, false, { position, mask: false, touch: true });
    try {
      await screen.findByTestId('workspace');
      await act(async () => { await router.push('/workspace/details'); });
      await screen.findByTestId('details');
      expect(container.querySelector('.rvr-route-drawer-mask')).toBeNull();
      const frame = container.querySelector('.rvr-route-drawer-container-inline') as HTMLElement;
      expect(frame).toBeTruthy();
      expect(frame.style.justifyContent).toBe(position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center');
      expect(frame.style.alignItems).toBe(position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center');
      expect(frame.querySelector(`.rvr-route-drawer-${position}`)).toBeTruthy();
      await act(async () => { await router.replace('/workspace'); });
      await waitFor(() => expect(container.querySelector(`.rvr-slide-${position}-leave-active`)).toBeTruthy());
      fireEvent.animationEnd(frame.querySelector('.rvr-route-drawer') as HTMLElement);
      expect(container.querySelector('.rvr-route-drawer-container')).toBeNull();
      expect(screen.getByTestId('workspace')).toBeTruthy();
    } finally { unmount(); router.stop(); }
  });

  it('默认显示遮罩并使用与面板相同的进出动画时长', async () => {
    const { router, container, unmount } = setup();
    try {
      await screen.findByTestId('workspace');
      await act(async () => { await router.push('/workspace/details'); });
      const mask = container.querySelector('.rvr-route-drawer-mask') as HTMLElement;
      expect(mask.style.animationDuration).toBe('200ms');
      await waitFor(() => expect(mask.classList.contains('rvr-route-drawer-fade-enter-active')).toBe(true));
      await act(async () => { await router.replace('/workspace'); });
      await waitFor(() => expect(mask.classList.contains('rvr-route-drawer-fade-leave-active')).toBe(true));
      fireEvent.animationEnd(mask.querySelector('.rvr-route-drawer') as HTMLElement);
      expect(container.querySelector('.rvr-route-drawer-mask')).toBeNull();
    } finally { unmount(); router.stop(); }
  });

  it.each([false, true])('maskClosable=%s 控制点击遮罩返回父路由，点击内容不关闭', async (maskClosable) => {
    const { router, container, unmount } = setup(undefined, false, { maskClosable, touch: true });
    try {
      await screen.findByTestId('workspace');
      await act(async () => { await router.push('/workspace/details'); });
      fireEvent.click(await screen.findByTestId('details'));
      expect(router.currentRoute!.path).toBe('/workspace/details');
      fireEvent.click(container.querySelector('.rvr-route-drawer-wrap')!);
      if (maskClosable) {
        await waitFor(() => expect(router.currentRoute!.path).toBe('/workspace'));
        await waitFor(() => expect(container.querySelector('.rvr-slide-right-leave-active')).toBeTruthy());
        fireEvent.animationEnd(container.querySelector('.rvr-route-drawer')!);
        expect(container.querySelector('.rvr-route-drawer-mask')).toBeNull();
      } else {
        expect(router.currentRoute!.path).toBe('/workspace/details');
        expect(container.querySelector('.rvr-route-drawer-mask')).toBeTruthy();
      }
    } finally { unmount(); router.stop(); }
  });

  it('进入子路由时打开，返回父路由时关闭并通知父页面', async () => {
    const { router, drawerRef, unmount } = setup();
    try {
      await screen.findByTestId('workspace');
      expect(drawerRef.current).toBeNull();
      act(() => syncNavigate(router, '/workspace/details'));
      expect(await screen.findByTestId('details')).toBeTruthy();
      expect(router.currentRoute?.path).toBe('/workspace/details');
      expect(drawerRef.current).toBeInstanceOf(HTMLElement);
      expect(lifecycle.willUnactivate).toHaveBeenCalledTimes(1);
      expect(parentHooks.deactivate).toHaveBeenCalledTimes(1);

      act(() => syncNavigate(router, '/workspace'));
      await waitFor(() => expect(router.currentRoute?.path).toBe('/workspace'));
      expect(drawerRef.current).toBeInstanceOf(HTMLElement);
      await waitFor(() => expect(document.querySelector('.rvr-slide-right-leave-active')).toBeTruthy());
      fireEvent.animationEnd(document.querySelector('.rvr-route-drawer') as HTMLElement);
      expect(drawerRef.current).toBeNull();
      expect(lifecycle.didActivate).toHaveBeenCalledTimes(1);
      expect(parentHooks.activate).toHaveBeenCalledTimes(1);

      expect(screen.getByTestId('workspace')).toBeTruthy();
    } finally {
      unmount();
      router.stop();
    }
  });

  it('父 hooks 接收相同事件契约，抽屉内容保持激活且切换子路由不重复通知', async () => {
    const { router, unmount } = setup();
    try {
      await screen.findByTestId('workspace');
      expect(parentHooks.activate).not.toHaveBeenCalled();
      await act(async () => { await router.push('/workspace/details'); });
      await screen.findByTestId('details');
      const drawerView = router.currentRoute!.matched[1].viewInstances.default;
      expect(drawerView.isActivate).toBe(true);
      expect(parentHooks.deactivate).toHaveBeenCalledWith(expect.objectContaining({
        type: 'deactivate',
        router,
        source: drawerView,
        target: expect.objectContaining({ path: '/workspace' }),
        to: expect.objectContaining({ path: '/workspace/details' }),
        from: null,
      }));
      expect(childHooks.deactivate).not.toHaveBeenCalled();
      await act(async () => { await router.push('/workspace/other'); });
      await screen.findByTestId('other');
      expect(parentHooks.deactivate).toHaveBeenCalledTimes(1);
      expect(parentHooks.activate).not.toHaveBeenCalled();
      await act(async () => { await router.replace('/workspace'); });
      expect(parentHooks.activate).toHaveBeenCalledWith(expect.objectContaining({
        type: 'activate',
        router,
        source: drawerView,
        to: null,
        target: expect.objectContaining({ path: '/workspace' }),
        from: expect.objectContaining({ path: '/workspace/other' }),
      }));
      expect(lifecycle.didActivate).toHaveBeenCalledTimes(1);
    } finally { unmount(); router.stop(); }
  });

  it('组合入口将子路由限制在父页面容器内并保留父页面实例', async () => {
    const { router, unmount, container } = setup();
    try {
      const parent = await screen.findByTestId('workspace');
      act(() => syncNavigate(router, '/workspace/details'));
      expect(await screen.findByTestId('details')).toBeTruthy();
      expect(screen.getByTestId('workspace')).toBe(parent);
      expect(parent.querySelector('.rvr-route-drawer-mask-inline')).toBeTruthy();
      expect(parent.querySelector('.rvr-slide-right-enter')).toBeTruthy();
      expect(container.querySelector('[id^="rvr-route-drawer-container-"]')).toBeNull();
      expect(lifecycle.willUnactivate).toHaveBeenCalledTimes(1);
      expect(parentHooks.deactivate).toHaveBeenCalledTimes(1);

      await act(async () => { await router.replace('/workspace'); });
      expect(router.currentRoute?.path).toBe('/workspace');
      expect(screen.getByTestId('workspace')).toBe(parent);
      expect(parent.querySelector('.rvr-slide-right-leave')).toBeTruthy();
      expect(lifecycle.didActivate).toHaveBeenCalledTimes(1);
      expect(parentHooks.activate).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
      router.stop();
    }
  });

  it('嵌套抽屉只通知各自的父路由 hooks', async () => {
    const root = { activate: jest.fn(), deactivate: jest.fn() };
    const panel = { activate: jest.fn(), deactivate: jest.fn() };
    function RootPage() {
      useViewActivate(root.activate);
      useViewDeactivate(root.deactivate);
      return <main data-testid="nested-root"><RouterDrawer /></main>;
    }
    function PanelPage() {
      useViewActivate(panel.activate);
      useViewDeactivate(panel.deactivate);
      return <section data-testid="nested-panel"><RouterDrawer /></section>;
    }
    const router = createTestRouter([
      {
        path: '/root',
        component: RootPage,
        children: [
          {
            path: '/panel',
            component: PanelPage,
            children: [
              { path: '/inner', component: () => <div data-testid="nested-inner">inner</div> },
            ]
          },
        ]
      },
    ]);
    syncNavigate(router, '/root');
    const view = render(<RouterView router={router} />);
    try {
      await screen.findByTestId('nested-root');
      await act(async () => { await router.push('/root/panel'); });
      await screen.findByTestId('nested-panel');
      expect(root.deactivate).toHaveBeenCalledTimes(1);
      expect(panel.deactivate).not.toHaveBeenCalled();
      await act(async () => { await router.push('/root/panel/inner'); });
      await screen.findByTestId('nested-inner');
      expect(panel.deactivate).toHaveBeenCalledTimes(1);
      expect(root.deactivate).toHaveBeenCalledTimes(1);
      await act(async () => { await router.replace('/root/panel'); });
      expect(panel.activate).toHaveBeenCalledTimes(1);
      expect(root.activate).not.toHaveBeenCalled();
      await act(async () => { await router.replace('/root'); });
      expect(root.activate).toHaveBeenCalledTimes(1);
    } finally { view.unmount(); router.stop(); }
  });

  it('普通 RouterView 与内层 Drawer 共存，遮罩只回退一层且尊重返回守卫', async () => {
    const parentHooks = { activate: jest.fn(), deactivate: jest.fn() };
    function Root() { return <RouterDrawer />; }
    function Outer() {
      useViewActivate(parentHooks.activate);
      useViewDeactivate(parentHooks.deactivate);
      return <section data-testid="outer-view"><RouterView /></section>;
    }
    function Child() {
      const [note, setNote] = React.useState('');
      return <section data-testid="child-view">
        <input aria-label="child note" value={note} onChange={(event) => setNote(event.target.value)} />
        <RouterDrawer maskClosable portalContainer={() => document.body} />
      </section>;
    }
    const router = createTestRouter([{
      path: '/root',
      component: Root,
      children: [
        {
          path: '/outer',
          component: Outer,
          children: [
            {
              path: '/child',
              component: Child,
              children: [
                { path: '/inner', component: () => <div data-testid="inner-view">inner</div> },
              ]
            },
          ]
        },
      ]
    }]);
    syncNavigate(router, '/root');
    const view = render(<RouterView router={router} />);
    let rejectBack = true;
    try {
      await act(async () => { await router.push('/root/outer'); });
      await screen.findByTestId('outer-view');
      await act(async () => { await router.push('/root/outer/child'); });
      fireEvent.change(await screen.findByLabelText('child note'), { target: { value: 'retained' } });
      await act(async () => { await router.push('/root/outer/child/inner'); });
      const inner = await screen.findByTestId('inner-view');
      const mask = inner.closest('.rvr-route-drawer-mask')!;
      const back = jest.spyOn(router, 'back');
      router.beforeEach((to, _from, next) => next(rejectBack && to.path === '/root/outer/child' ? false : undefined));
      await act(async () => { fireEvent.click(mask); });
      expect(back).toHaveBeenCalledTimes(1);
      expect(router.currentRoute?.path).toBe('/root/outer/child/inner');
      expect(screen.getByTestId('inner-view')).toBeTruthy();
      rejectBack = false;
      await act(async () => { fireEvent.click(mask); });
      await waitFor(() => expect(router.currentRoute?.path).toBe('/root/outer/child'));
      expect(back).toHaveBeenCalledTimes(2);
      expect((screen.getByLabelText('child note') as HTMLInputElement).value).toBe('retained');
      expect(screen.getByTestId('outer-view')).toBeTruthy();
      expect(parentHooks.deactivate).not.toHaveBeenCalled();
    } finally { view.unmount(); router.stop(); }
  });

  it('守卫拒绝进入子路由时不应打开抽屉或触发父页面失活', async () => {
    const { router, drawerRef, unmount } = setup();
    try {
      await screen.findByTestId('workspace');
      router.beforeEach((to, _from, next) => {
        next(to.path === '/workspace/details' ? false : undefined);
      });
      await act(async () => {
        await expect(new Promise((resolve, reject) => {
          router.push('/workspace/details', resolve, reject).catch(() => undefined);
        })).rejects.toBe(false);
      });
      expect(router.currentRoute?.path).toBe('/workspace');
      expect(drawerRef.current).toBeNull();
      expect(screen.queryByTestId('details')).toBeNull();
      expect(lifecycle.willUnactivate).not.toHaveBeenCalled();
      expect(parentHooks.deactivate).not.toHaveBeenCalled();
      expect(parentHooks.activate).not.toHaveBeenCalled();
    } finally {
      unmount();
      router.stop();
    }
  });

  it('KeepAlive 子路由返回后重新进入时仍保留同一个组件实例', async () => {
    const { router, unmount } = setup(undefined, true);
    try {
      await screen.findByTestId('workspace');
      act(() => syncNavigate(router, '/workspace/details'));
      const details = await screen.findByTestId('details');
      await act(async () => { await router.replace('/workspace'); });
      await act(async () => { await router.push('/workspace/details'); });
      expect(await screen.findByTestId('details')).toBe(details);
      expect(lifecycle.willUnactivate).toHaveBeenCalledTimes(2);
      expect(lifecycle.didActivate).toHaveBeenCalledTimes(1);
      expect(parentHooks.activate).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
      router.stop();
    }
  });
});
