import React from 'react';
import { lazyImport, RouteLazy } from '../src/route-lazy';
import { RouteLazyRenderer } from '../src/route-lazy-renderer';
import { normalizeRoutes, renderRoute } from '../src/util';

describe('RouteLazy 公共行为基线', () => {
  const Page = (props: any) => React.createElement('div', props, props.children);

  it('lazy factory 应收到 route、view key、router 和原始 options', async () => {
    const route = { path: '/lazy' } as any;
    const router = { name: 'router' } as any;
    const options = { custom: 'value' };
    const factory = jest.fn(() => Page);
    const lazy = lazyImport(factory, options);

    await expect(lazy.toResolve(router, route, 'footer')).resolves.toBe(Page);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith(route, 'footer', router, options);
    expect(lazy.options).toBe(options);
  });

  it('普通 Function Component 应作为组件返回而不能被提前调用', async () => {
    const component = jest.fn(() => React.createElement('div'));
    const lazy = new RouteLazy(component);

    await expect(lazy.toResolve({} as any, {} as any, 'default')).resolves.toBe(component);
    expect(component).not.toHaveBeenCalled();
  });

  it('应兼容返回 thenable 的 lazy factory', async () => {
    const thenable = {
      then(resolve: (component: typeof Page) => void) {
        resolve(Page);
      },
    };
    const lazy = lazyImport(() => thenable as any);

    await expect(lazy.toResolve({} as any, {} as any, 'default')).resolves.toBe(Page);
  });

  it('updater 应按顺序替换组件并把最终结果写入缓存', async () => {
    const router = { name: 'router' } as any;
    const WrappedPage = () => React.createElement('section');
    const lazy = new RouteLazy(Page);
    const first = jest.fn(() => WrappedPage);
    const second = jest.fn((component) => component);
    lazy.updaters.push(first, second);

    await expect(lazy.toResolve(router, {} as any, 'default')).resolves.toBe(WrappedPage);
    await expect(lazy.toResolve(router, {} as any, 'default')).resolves.toBe(WrappedPage);
    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith(Page, router);
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(WrappedPage, router);
  });

  it('updater 返回空值时应保留前一个组件', async () => {
    const lazy = new RouteLazy(Page);
    lazy.updaters.push(() => null as any);

    await expect(lazy.toResolve({} as any, {} as any, 'default')).resolves.toBe(Page);
  });

  it('解析失败后应允许再次调用 factory 重试', async () => {
    const factory = jest.fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockResolvedValueOnce(Page);
    const lazy = lazyImport(factory);

    await expect(lazy.toResolve({} as any, {} as any, 'default')).rejects.toThrow('first failure');
    await expect(lazy.toResolve({} as any, {} as any, 'default')).resolves.toBe(Page);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('并发解析应复用 pending Promise 且只执行一次 factory', async () => {
    let resolveFactory: (component: typeof Page) => void = () => undefined;
    const componentPromise = new Promise<typeof Page>((resolve) => {
      resolveFactory = resolve;
    });
    const factory = jest.fn(() => componentPromise);
    const lazy = lazyImport(factory);

    const first = lazy.toResolve({} as any, {} as any, 'default');
    const second = lazy.toResolve({} as any, {} as any, 'default');
    resolveFactory(Page);

    await expect(Promise.all([first, second])).resolves.toEqual([Page, Page]);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('factory 同步抛错应 reject 并允许重试', async () => {
    const factory = jest.fn()
      .mockImplementationOnce(() => { throw new Error('sync failure'); })
      .mockReturnValueOnce(Page);
    const lazy = lazyImport(factory);

    await expect(lazy.toResolve({} as any, {} as any, 'default')).rejects.toThrow('sync failure');
    await expect(lazy.toResolve({} as any, {} as any, 'default')).resolves.toBe(Page);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('ES Module default 为空时应 reject', async () => {
    const lazy = lazyImport(() => Promise.resolve({ __esModule: true, default: null } as any));

    await expect(lazy.toResolve({} as any, {} as any, 'default'))
      .rejects.toThrow('component should not null!');
  });

  it('兼容 render 应透传 props、children 和 ref', async () => {
    const lazy = new RouteLazy(Page);
    const ref = React.createRef<HTMLDivElement>();
    await lazy.toResolve({} as any, {} as any, 'default');

    const element = lazy.render({ id: 'page', children: 'content' }, ref) as React.ReactElement<any>;
    expect(element.type).toBe(Page);
    expect(element.props).toMatchObject({ id: 'page', children: 'content' });
  });

  it('hydrate RouteLazy 解析后应保留描述对象并交给稳定 renderer', async () => {
    const router = { name: 'router' } as any;
    const lazy = lazyImport(() => Page, { hydrate: true });
    const routes = normalizeRoutes([{ path: '/ssr', component: lazy }]);

    expect(lazy.shouldHydrate).toBe(true);
    await lazy.toResolve(router, routes[0], 'default');
    expect(routes[0].components.default).toBe(lazy);

    const element = renderRoute(
      routes[0],
      routes,
      { id: 'ssr-page' },
      'route child',
      { router, name: 'default' },
    ) as React.ReactElement<any>;

    expect(element.type).toBe(RouteLazyRenderer);
    expect(element.props).toMatchObject({ lazy, route: routes[0], router, viewName: 'default' });
    expect(element.props.componentProps).toMatchObject({
      id: 'ssr-page',
      children: 'route child',
    });
  });

  it('hydrate object 应启用 runtime renderer，false 和缺省值保持 browser 路径', () => {
    expect(lazyImport(() => Page, { hydrate: { required: true } }).shouldHydrate).toBe(true);
    expect(lazyImport(() => Page, { hydrate: false }).shouldHydrate).toBe(false);
    expect(lazyImport(() => Page).shouldHydrate).toBe(false);
  });
});
