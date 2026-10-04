import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { lazyImport, RouteLazy } from '../src/route-lazy';
import {
  BrowserRouteRenderer,
  renderBrowserRoute,
  RouteLazyRenderer,
} from '../src/route-lazy-renderer';
import { RouteRuntimeAdapterProvider } from '../src/route-runtime-context';

class ErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {

  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  render() {
    return this.state.error
      ? React.createElement('div', {}, this.state.error.message)
      : this.props.children;
  }

}

describe('route lazy renderers', () => {
  const Page = (props: any) => React.createElement('div', props, props.children);

  it('renderBrowserRoute 无组件时应返回 null', () => {
    expect(renderBrowserRoute(null, { children: 'empty' })).toBeNull();
  });

  it('renderBrowserRoute 应透传组件 props、children 和 ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    const element = renderBrowserRoute(Page, { id: 'page', children: 'content' }, ref) as React.ReactElement<any>;

    expect(element.type).toBe(Page);
    expect(element.props).toMatchObject({ id: 'page', children: 'content' });
  });

  it('renderBrowserRoute 未提供 props 时应使用空 props', () => {
    const element = renderBrowserRoute(Page) as React.ReactElement<any>;

    expect(element.type).toBe(Page);
    expect(element.props.children).toBeUndefined();
  });

  it('BrowserRouteRenderer 应委托普通组件渲染', () => {
    const element = BrowserRouteRenderer({
      component: Page,
      componentProps: { id: 'browser', children: 'child' },
    }) as React.ReactElement<any>;

    expect(element.type).toBe(Page);
    expect(element.props).toMatchObject({ id: 'browser', children: 'child' });
  });

  it('RouteLazyRenderer 未解析时应向稳定 BrowserRouteRenderer 传入 null', () => {
    const lazy = new RouteLazy(Promise.resolve(Page));
    expect(lazy.isResolved).toBe(false);
    const element = RouteLazyRenderer({ lazy, componentProps: { id: 'lazy' } }) as React.ReactElement<any>;

    expect(element.type).toBe(BrowserRouteRenderer);
    expect(element.props.component).toBeNull();
  });

  it('RouteLazyRenderer 解析后应向稳定 BrowserRouteRenderer 传入最终组件', async () => {
    const lazy = new RouteLazy(Page);
    await lazy.toResolve({} as any, {} as any, 'default');
    expect(lazy.isResolved).toBe(true);
    const element = RouteLazyRenderer({ lazy, componentProps: { id: 'lazy' } }) as React.ReactElement<any>;

    expect(element.type).toBe(BrowserRouteRenderer);
    expect(element.props.component).toBe(Page);
  });

  it('hydrate 可选但没有 adapter 时应降级为普通 client render', async () => {
    const lazy = lazyImport(() => Page, { hydrate: true });
    await lazy.toResolve({} as any, {} as any, 'default');

    render(React.createElement(RouteLazyRenderer, {
      lazy,
      route: { path: '/ssr', depth: 0 } as any,
      componentProps: { children: 'client fallback' },
    }));

    expect(screen.getByText('client fallback')).toBeInTheDocument();
  });

  it('adapter 接管时应执行 prepare/activate/update/deactivate 且不重复渲染 client DOM', async () => {
    const lazy = lazyImport(() => Page, {
      hydrate: {
        owner: 'standalone-ssr',
        wrapElement: (element) => React.createElement('section', { id: 'wrapped' }, element),
      },
    });
    await lazy.toResolve({} as any, {} as any, 'default');
    const adapter = {
      name: 'test-ssr',
      owner: 'standalone-ssr' as const,
      canHandle: jest.fn(() => true),
      prepare: jest.fn(),
      activate: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };
    const route = { path: '/ssr', depth: 0 } as any;
    const view = (child: string) => React.createElement(
      RouteRuntimeAdapterProvider,
      { value: adapter },
      React.createElement(RouteLazyRenderer, {
        lazy,
        route,
        viewName: 'main',
        componentProps: { children: child },
      }),
    );

    const result = render(view('server content'));
    await waitFor(() => expect(adapter.activate).toHaveBeenCalledTimes(1));
    expect(adapter.prepare).toHaveBeenCalledTimes(1);
    expect(adapter.activate.mock.calls[0][0]).toEqual(expect.objectContaining({
      descriptor: expect.objectContaining({
        owner: 'standalone-ssr',
        routeId: '0%7C%2Fssr%7Cmain',
      }),
      component: expect.objectContaining({ type: 'section' }),
    }));
    expect(screen.queryByText('server content')).not.toBeInTheDocument();

    result.rerender(view('updated content'));
    await waitFor(() => expect(adapter.update).toHaveBeenCalled());
    act(() => result.unmount());
    expect(adapter.deactivate).toHaveBeenCalledTimes(1);
  });

  it('路由 descriptor 改变后为已取消事务创建新的 navigation signal', async () => {
    const lazy = lazyImport(() => Page, { hydrate: true });
    await lazy.toResolve({} as any, {} as any, 'default');
    const adapter = {
      name: 'route-switch',
      owner: 'standalone-ssr' as const,
      canHandle: jest.fn(() => true),
      prepare: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
    };
    const view = (path: string) => React.createElement(
      RouteRuntimeAdapterProvider,
      { value: adapter },
      React.createElement(RouteLazyRenderer, { lazy, route: { path, depth: 0 } as any }),
    );
    const result = render(view('/first'));
    await waitFor(() => expect(adapter.activate).toHaveBeenCalledTimes(1));
    result.rerender(view('/second'));
    await waitFor(() => expect(adapter.activate).toHaveBeenCalledTimes(2));
    expect(adapter.prepare).toHaveBeenCalledTimes(2);
    result.unmount();
  });

  it('adapter 拒绝可选 hydration 时应调用 onError 并 client render', async () => {
    const onError = jest.fn();
    const lazy = lazyImport(() => Page, { hydrate: { onError } });
    await lazy.toResolve({} as any, {} as any, 'default');
    const adapter = {
      name: 'rejecting',
      owner: 'standalone-ssr' as const,
      canHandle: jest.fn(() => Promise.resolve(false)),
      activate: jest.fn(),
    };

    render(React.createElement(
      RouteRuntimeAdapterProvider,
      { value: adapter },
      React.createElement(RouteLazyRenderer, {
        lazy,
        route: { path: '/fallback', depth: 1 } as any,
        componentProps: { children: 'recovered client page' },
      }),
    ));

    await waitFor(() => expect(screen.getByText('recovered client page')).toBeInTheDocument());
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('No runtime adapter accepted') }),
      expect.objectContaining({ viewName: 'default' }),
    );
    expect(adapter.activate).not.toHaveBeenCalled();
  });

  it('hydrate renderer 缺少 route 信息时应安全回退 client render', async () => {
    const lazy = lazyImport(() => Page, { hydrate: true });
    await lazy.toResolve({} as any, {} as any, 'default');

    render(React.createElement(RouteLazyRenderer, {
      lazy,
      componentProps: { children: 'route-less fallback' },
    }));

    expect(screen.getByText('route-less fallback')).toBeInTheDocument();
  });

  it('required hydration 缺少 adapter 时应进入 Error Boundary', async () => {
    const onError = jest.fn();
    const lazy = lazyImport(() => Page, { hydrate: { required: true, onError } });
    await lazy.toResolve({} as any, {} as any, 'default');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(React.createElement(
      ErrorBoundary,
      {},
      React.createElement(RouteLazyRenderer, {
        lazy,
        route: { path: '/required', depth: 0 } as any,
      }),
    ));

    await waitFor(() => expect(screen.getByText(/No runtime adapter is available/)).toBeInTheDocument());
    expect(onError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it('required hydration adapter 拒绝请求时进入 Error Boundary', async () => {
    const lazy = lazyImport(() => Page, { hydrate: { required: true } });
    await lazy.toResolve({} as any, {} as any, 'default');
    const adapter = {
      name: 'required-reject',
      owner: 'standalone-ssr' as const,
      canHandle: jest.fn(() => false),
    };
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(React.createElement(
      RouteRuntimeAdapterProvider,
      { value: adapter },
      React.createElement(ErrorBoundary, {}, React.createElement(RouteLazyRenderer, {
        lazy,
        route: { path: '/required-reject', depth: 0 } as any,
      })),
    ));
    await waitFor(() => expect(screen.getByText(/No runtime adapter accepted/)).toBeInTheDocument());
    consoleError.mockRestore();
  });

  it('卸载时应取消 pending prepare，并在异步完成后释放 adapter', async () => {
    let finishPrepare = () => undefined;
    const preparing = new Promise<void>((resolve) => { finishPrepare = resolve; });
    const lazy = lazyImport(() => Page, { hydrate: true });
    await lazy.toResolve({} as any, {} as any, 'default');
    const adapter = {
      name: 'slow-adapter',
      owner: 'standalone-ssr' as const,
      canHandle: jest.fn(() => true),
      prepare: jest.fn(() => preparing),
      activate: jest.fn(),
      deactivate: jest.fn(),
    };
    const result = render(React.createElement(
      RouteRuntimeAdapterProvider,
      { value: adapter },
      React.createElement(RouteLazyRenderer, {
        lazy,
        route: { path: '/slow', depth: 0 } as any,
      }),
    ));
    await waitFor(() => expect(adapter.prepare).toHaveBeenCalled());

    result.unmount();
    finishPrepare();

    await waitFor(() => expect(adapter.deactivate).toHaveBeenCalledTimes(1));
    expect(adapter.activate).not.toHaveBeenCalled();
  });

  it('adapter 无 deactivate 时取消 pending prepare 也不会激活 runtime', async () => {
    let finishPrepare = () => undefined;
    const preparing = new Promise<void>((resolve) => { finishPrepare = resolve; });
    const lazy = lazyImport(() => Page, { hydrate: true });
    await lazy.toResolve({} as any, {} as any, 'default');
    const adapter = {
      name: 'prepare-only-adapter',
      owner: 'standalone-ssr' as const,
      canHandle: jest.fn(() => true),
      prepare: jest.fn(() => preparing),
      activate: jest.fn(),
    };
    const result = render(React.createElement(
      RouteRuntimeAdapterProvider,
      { value: adapter },
      React.createElement(RouteLazyRenderer, {
        lazy,
        route: { path: '/prepare-only', depth: 0 } as any,
      }),
    ));
    await waitFor(() => expect(adapter.prepare).toHaveBeenCalled());
    result.unmount();
    finishPrepare();
    await act(async () => { await preparing; });
    expect(adapter.activate).not.toHaveBeenCalled();
  });

  it('非 Error 的 adapter 异常应规范化后走可选 client fallback', async () => {
    const onError = jest.fn();
    const lazy = lazyImport(() => Page, { hydrate: { onError } });
    await lazy.toResolve({} as any, {} as any, 'default');
    const adapter = {
      name: 'broken-adapter',
      owner: 'standalone-ssr' as const,
      canHandle: jest.fn(() => Promise.reject('adapter offline')),
      activate: jest.fn(),
    };

    render(React.createElement(
      RouteRuntimeAdapterProvider,
      { value: adapter },
      React.createElement(RouteLazyRenderer, {
        lazy,
        route: { path: '/broken', depth: 0 } as any,
        componentProps: { children: 'offline fallback' },
      }),
    ));

    await waitFor(() => expect(screen.getByText('offline fallback')).toBeInTheDocument());
    expect(onError.mock.calls[0][0]).toEqual(expect.objectContaining({
      message: expect.stringContaining('adapter offline'),
    }));
  });
});
