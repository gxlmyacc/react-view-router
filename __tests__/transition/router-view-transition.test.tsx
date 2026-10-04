import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import RouterViewTransition from '../../transition/src/RouterView';
import TransitionPresenterContext from '../../transition/src/TransitionPresenterContext';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About } from '../helpers/test-utils';

/**
 * 触发当前页面过渡元素的 transitionend，便于 JSDOM 完成切换。
 */
function finishTransition() {
  const node = document.querySelector('[class*="react-view-router-"][class*="-exit"]')
    || document.querySelector('[class*="react-view-router-"][class*="-enter"]');
  if (node) fireEvent.transitionEnd(node);
}

describe('RouterViewTransition 过渡路由', () => {
  it('应渲染子路由并支持 fade 过渡', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, exact: true },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(
      React.createElement(RouterViewTransition, {
        router,
        transition: 'fade',
        transitionDuration: 900,
      }),
      router,
    );
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    expect(await screen.findByTestId('home')).toBeTruthy();
    await act(async () => {
      await new Promise<void>((resolve) => { router.push('/about', resolve); });
    });
    const entering = document.querySelector('.react-view-router-fade-enter') as HTMLElement;
    expect(entering.style.transitionDuration).toBe('900ms');
    act(() => finishTransition());
    await waitFor(() => expect(screen.getByTestId('about')).toBeTruthy());
    router.stop();
  });

  it('transition 对象配置应生效', async () => {
    const router = createTestRouter([{ path: '/', component: Home }]);
    syncNavigate(router, '/');
    renderWithRouter(
      React.createElement(RouterViewTransition, {
        router,
        transition: {
          name: 'none',
          zIndex: 2000,
          containerStyle: { backgroundColor: '#fff' },
        },
      }),
      router,
    );
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    expect(await screen.findByTestId('home')).toBeTruthy();
    router.stop();
  });

  it('carousel 过渡模式应可渲染', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/next', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(
      React.createElement(RouterViewTransition, {
        router,
        transition: 'carousel',
      }),
      router,
    );
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await act(async () => {
      await new Promise<void>((resolve) => { router.push('/next', resolve); });
    });
    act(() => finishTransition());
    await waitFor(() => expect(screen.getByTestId('about')).toBeTruthy());
    router.stop();
  });

  it('slide 过渡应渲染容器', async () => {
    const router = createTestRouter([{ path: '/', component: Home }]);
    syncNavigate(router, '/');
    renderWithRouter(
      React.createElement(RouterViewTransition, {
        router,
        transition: 'slide',
      }),
      router,
    );
    await waitFor(() => expect(router.isPrepared).toBe(true));
    expect(await screen.findByTestId('home')).toBeTruthy();
    router.stop();
  });

  it('routerView 指向包装组件自身时回退到基础 RouterView', async () => {
    const router = createTestRouter([{ path: '/', component: Home }]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewTransition, {
      router,
      routerView: RouterViewTransition,
      transition: 'none',
    }), router);
    await waitFor(() => expect(router.isPrepared).toBe(true));
    expect(await screen.findByTestId('home')).toBeTruthy();
    router.stop();
  });

  it('未知动效和空对象配置安全回退，且 classNames 可解析无方向导航', () => {
    const router = createTestRouter([{ path: '/', component: Home }]);
    const captured: any[] = [];
    const Probe = () => React.createElement(TransitionPresenterContext.Consumer, null, (options) => {
      captured.push(options);
      return null;
    });

    const first = renderWithRouter(React.createElement(RouterViewTransition, {
      router,
      routerView: Probe,
      transition: 'unsupported' as any,
    }), router);
    expect(captured[0].transitionMap.mode).toBe('none');
    first.unmount();

    renderWithRouter(React.createElement(RouterViewTransition, {
      router,
      routerView: Probe,
      transition: { name: '', zIndex: 0 } as any,
      transitionFallback: 'none',
    }), router);
    const transitionMap = captured[captured.length - 1].transitionMap;
    (router.currentRoute as any).action = 'REPLACE';
    expect(transitionMap.props.classNames()).toBe('');
    router.stop();
  });

  it('slide fallback 使 replace 也可完成过渡', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, exact: true },
      { path: '/next', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewTransition, {
      router,
      transition: 'slide',
      transitionFallback: 'slide-left',
    }), router);
    await screen.findByTestId('home');
    await act(async () => {
      await new Promise<void>((resolve) => { router.replace('/next', resolve); });
    });
    await waitFor(() => expect(screen.getByTestId('about')).toBeTruthy());
    router.stop();
  });

  it('slide uses the local view backdrop instead of the body color during push and pop', async () => {
    const originalBodyColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'rgb(243, 249, 241)';
    const router = createTestRouter([
      { path: '/', component: Home, exact: true },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/');
    const view = renderWithRouter(React.createElement('section', {
      style: { backgroundColor: '#fff' },
    }, React.createElement(RouterViewTransition, {
      router,
      transition: 'slide',
      transitionZIndex: 2000,
      containerStyle: { backgroundColor: '#fff' },
    })), router);
    try {
      await screen.findByTestId('home');
      await act(async () => {
        await new Promise<void>((resolve) => { router.push('/about', resolve); });
      });
      const entering = document.querySelector('.react-view-router-slide-left-enter') as HTMLElement;
      const outgoing = document.querySelector('.react-view-router-slide-left-exit') as HTMLElement;
      expect(entering.style.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(outgoing.style.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(entering.style.zIndex).toBe('2000');
      act(() => fireEvent.transitionEnd(entering, { propertyName: 'width' }));
      expect(document.querySelector('[aria-hidden="true"]')).toBeTruthy();
      act(() => fireEvent.transitionEnd(entering, { propertyName: 'transform' }));

      act(() => { router.back(); });
      await waitFor(() => expect(router.currentRoute?.path).toBe('/'));
      const returning = document.querySelector('.react-view-router-slide-right-enter') as HTMLElement;
      const leaving = document.querySelector('.react-view-router-slide-right-exit') as HTMLElement;
      expect(returning.style.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(leaving.style.backgroundColor).toBe('rgb(255, 255, 255)');
      await waitFor(() => expect(returning.style.backgroundColor).toBe(''));
    } finally {
      view.unmount();
      router.stop();
      document.body.style.backgroundColor = originalBodyColor;
    }
  });

  it.each(['slide', 'fade-through', 'zoom'] as const)('%s: KeepAlive 退场快照仍可见，返回后保留状态', async (transition) => {
    const onMount = jest.fn();
    function StatefulHome() {
      const [count, setCount] = React.useState(0);
      React.useEffect(() => { onMount(); }, []);
      return React.createElement('button', {
        'data-testid': 'stateful-home',
        onClick: () => setCount((value) => value + 1),
      }, `count:${count}`);
    }
    const router = createTestRouter([
      { path: '/', component: StatefulHome, keepAlive: true },
      { path: '/about', component: About },
    ], { keepAlive: true });
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewTransition, {
      router,
      transition,
    }), router);
    const home = await screen.findByTestId('stateful-home');
    fireEvent.click(home);
    expect(home.textContent).toBe('count:1');

    await act(async () => {
      await new Promise<void>((resolve) => { router.push('/about', resolve); });
    });
    expect(await screen.findByTestId('about')).toBeTruthy();
    expect(document.querySelectorAll('[data-testid="stateful-home"]').length).toBeGreaterThan(0);
    expect(document.querySelector('[aria-hidden="true"] [data-testid="stateful-home"]')).toBeTruthy();
    act(() => finishTransition());

    act(() => { router.back(); });
    await waitFor(() => expect(router.currentRoute?.path).toBe('/'));
    act(() => finishTransition());
    await waitFor(() => expect(screen.getByTestId('stateful-home').textContent).toBe('count:1'));
    expect(onMount).toHaveBeenCalledTimes(1);
    router.stop();
  });
});
