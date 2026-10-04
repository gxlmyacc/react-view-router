/* eslint-disable max-classes-per-file -- isolated component fixtures for ref compatibility */
import React from 'react';
import { act, render } from '@testing-library/react';
import * as util from '../../src/util';
import { RouteLazy } from '../../src/route-lazy';
import { REACT_FORWARD_REF_TYPE } from '../../src/route-guard';
import { Home } from '../helpers/test-utils';

describe('util 边界行为', () => {
  afterEach(() => jest.restoreAllMocks());

  it('nextTick 在显式上下文中执行回调', async () => {
    const ctx = { value: 7 };
    const callback = jest.fn(function (this: typeof ctx) { return this.value; });
    await util.nextTick(callback, ctx);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.results[0].value).toBe(7);
  });

  it('空回调、缺失字段和无匹配路由安全返回', () => {
    expect(util.nextTick(null as any)).toBeNull();
    expect(util.once(null as any)).toBeNull();
    const props = { kept: true };
    expect(util.omitProps(props, null as any)).toBe(props);
    expect(util.isConfigRoute(null)).toBeNull();
    expect(util.isConfigRoute({ _normalized: true })).toBeUndefined();
    expect(util.isRouteGuardInfoHooks(null)).toBeNull();
    expect(util.isRouteChildrenNormalized(null)).toBeNull();
    expect(util.normalizeRouteChildrenFn(null as any)).toBeNull();
    expect(util.readRouteMeta({ meta: {} } as any)).toBeUndefined();
    expect(util.getParentRoute({})).toBeNull();
    expect(util.resolveRedirect({} as any, { config: {} } as any)).toBe('');
    expect(util.mergeFns(null, () => 3)()).toBe(3);
  });

  it('ignoreCatch 默认报告异常且保留显式 this', () => {
    const error = new Error('failed');
    const report = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    util.ignoreCatch(() => { throw error; })();
    expect(report).toHaveBeenCalledWith(error);
    const ctx = { value: 4 };
    const callback = util.once(function (this: typeof ctx) { return this.value; }, ctx);
    expect(callback.call({ value: 5 })).toBe(4);
  });

  it('location 支持绝对 URL、显式 basename 和空 search', () => {
    expect(util.normalizeLocation('https://other.test/path', { mode: 'browser' })?.pathname)
      .toBe('https://other.test/path');
    expect(util.normalizeLocation('https://other.test/path', { mode: 'hash' })?.pathname)
      .toBe('https://other.test/path');
    expect(util.normalizeLocation({ path: '/page', absolute: true }, { basename: '/app' })?.basename).toBe('');
    expect(util.normalizeLocation({ path: '/page', basename: '/own' }, { basename: '/app' })?.path).toBe('/page');
    const location = util.normalizeLocation({ path: '/page', query: {} })!;
    expect(location.fullPath).toBe('/page');
  });

  it('函数 children 保留自定义属性并缓存规范化结果', () => {
    const factory = () => [{ path: '/child', component: Home }];
    Object.defineProperty(factory, 'cache', { value: { unrelated: true } });
    Object.defineProperty(factory, 'description', { value: 'child factory' });
    const normalized = util.normalizeRouteChildrenFn(factory);
    expect((normalized as any).description).toBe('child factory');
    expect(util.normalizeRouteChildrenFn(normalized)).toBe(normalized);
    expect(normalized()).toBe(normalized());
  });

  it('动态 meta 缺少 router 时使用空 siblings，函数 children 提供 siblings', () => {
    const title = jest.fn((_route, routes) => routes.length);
    const route = util.normalizeRoutes([{ path: '/meta', meta: { title } }])[0];
    expect(util.readRouteMeta(route, 'title')).toBe(0);
    const parent = util.normalizeRoutes([{
      path: '/parent', children: () => [{ path: 'child', meta: { title } }],
    }])[0];
    const child = util.getRouteChildren(parent.children!, parent)[0];
    expect(util.readRouteMeta(child, 'title')).toBe(1);
  });

  it('空 after interceptor 终止后续调用，卸载后的 lazy 结果不再挂载', async () => {
    const following = jest.fn();
    await util.afterInterceptors([null, following] as any, {} as any, null);
    expect(following).not.toHaveBeenCalled();
    let complete!: (component: React.ComponentType) => void;
    const Lazy = util.createLazyComponent(new Promise((resolve) => { complete = resolve; }));
    const view = render(React.createElement(Lazy));
    view.unmount();
    await act(async () => complete(Home));
    expect(view.container).toBeEmptyDOMElement();
  });

  it('named route props 可禁用，router 缺失不会报告变化', () => {
    const route = { config: { paramsProps: { named: false }, queryProps: { named: false } } } as any;
    expect(util.isMatchedRoutePropsChanged(route, {} as any, 'named')).toBe(false);
    expect(util.isMatchedRoutePropsChanged(route, null as any, 'named')).toBeNull();
    const props = {};
    util.configRouteProps(props, { named: false } as any, { field: 'value' }, 'named');
    expect(props).toEqual({});
  });

  it('fiber memoized state 上的视图标记能定位父视图', () => {
    const view = { state: { currentRoute: null } };
    const ctx = { _reactInternals: { return: { memoizedState: { _routerRoot: false }, stateNode: view } } };
    expect(util.getHostRouterView(ctx)).toBe(view);
    expect(util.getParentRoute(ctx)).toBeNull();
  });

  it('ref 能区分 forwardRef、guard wrapper 和带挂载方法的组件', () => {
    expect(util.isAcceptRef(null)).toBe(false);
    expect(util.isAcceptRef({ $$typeof: REACT_FORWARD_REF_TYPE, __componentClass: Home })).toBe(true);
    expect(util.isAcceptRef({ $$typeof: REACT_FORWARD_REF_TYPE, __guards: true })).toBe(false);
    function Legacy() { return null; }
    Legacy.prototype.componentDidMount = () => undefined;
    expect(util.isAcceptRef(Legacy)).toBe(true);
  });

  it('renderRoute 使用未指定 props 的默认值并遵守 enableRef 谓词', async () => {
    const [route] = util.normalizeRoutes([{
      path: '/ref',
      component: Home,
      defaultProps: { label: 'default' },
      enableRef: () => false,
    }]);
    const ref = jest.fn();
    const denied = util.renderRoute(route, [route], undefined, ['first', 'second'], { ref }) as React.ReactElement<any>;
    expect(denied.props.label).toBe('default');
    expect(denied.props.ref).toBeNull();
    route.enableRef = () => true;
    const allowed = util.renderRoute(route, [route], {}, null, { ref }) as React.ReactElement<any>;
    expect(allowed.props.ref).toEqual(expect.any(Function));
    await util.nextTick(() => undefined);
  });

  it('完整挂载树的 complete callback 收到 guard wrapper 内的组件实例', () => {
    class Inner extends React.Component {

      render() { return React.createElement('div', null, 'inner'); }

    }
    class Outer extends React.Component {

      render() { return React.createElement(Inner); }

    }
    Object.assign(Outer, { __componentClass: Inner });
    const [route] = util.normalizeRoutes([{ path: '/wrapped', component: Outer }]);
    const completed = jest.fn();
    route._pending.completeCallbacks.default = completed;
    const outerRef = jest.fn();
    const element = util.renderRoute(route, [route], {}, null, { ref: outerRef });
    const view = render(element);
    expect(outerRef.mock.calls[0][0]).toBeInstanceOf(Outer);
    expect(completed.mock.calls[0][0]).toBeInstanceOf(Inner);
    view.unmount();
  });

  it('lazy component 可传递 ref，lazy children 函数返回空值时清空 children', async () => {
    class App extends React.Component {

      render() { return React.createElement('div', null, 'lazy ref'); }

    }
    const ref = React.createRef<App>();
    const Wrapper = util.createLazyComponent(Promise.resolve(App));
    const view = render(React.createElement(Wrapper, { ref }));
    await act(async () => Promise.resolve());
    expect(ref.current).toBeInstanceOf(App);
    view.unmount();

    Object.assign(App, { __children: () => null });
    const lazy = new RouteLazy(App);
    const [route] = util.normalizeRoutes([{ path: '/lazy', component: lazy }]);
    await lazy.toResolve(null as any, route, 'default');
    expect(route.children).toHaveLength(0);
  });

  it('redirect 采用非 PUSH 来源时不重写 isReplace，完整 redirect 链返回最早路由', () => {
    const route = { config: { path: '/from' } } as any;
    expect(util.resolveRedirect('/to', route, { from: { action: 'POP', query: {} } as any }))
      .not.toHaveProperty('isReplace');
    const complete = { isComplete: true, path: '/first' };
    expect(util.getCompleteRoute({ redirectedFrom: complete } as any)).toBe(complete);
    expect(util.getLocationAction()).toBeUndefined();
    expect(util.readRouteMeta({ config: { meta: { label: 'matched' } } } as any, 'label')).toBe('matched');
  });
});
