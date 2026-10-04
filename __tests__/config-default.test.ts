import config, { parseQuery, stringifyQuery } from '../src/config';
import ReactViewRouter from '../src/router';
import { HistoryType } from '../src/history/types';

describe('config 默认导出', () => {
  it('应暴露 parseQuery 和 stringifyQuery', () => {
    expect(config.parseQuery).toBe(parseQuery);
    expect(config.stringifyQuery).toBe(stringifyQuery);
  });

  it('inheritProps 默认值应为 false', () => {
    expect(config.inheritProps).toBe(false);
  });

  it('createMergeStrategies 应为根组件注册 $route', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const mergeStrategies = config.createMergeStrategies(router);
    const vm: any = {
      _isReactViewRoot: false,
      $computed: jest.fn((target, key, fn) => {
        target[key] = fn;
      }),
      $root: { $route: { path: '/test' } },
      _routeIndex: 1,
    };
    mergeStrategies(null, null, vm);
    expect(vm.$computed).toHaveBeenCalledWith(vm, '$route', expect.any(Function));
    expect(vm.$computed).toHaveBeenCalledWith(vm, '$routeIndex', expect.any(Function));
    expect(vm.$computed).toHaveBeenCalledWith(vm, '$matchedRoute', expect.any(Function));
    router.stop();
  });

  it('应从宿主 RouterView 计算并缓存 route index', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const mergeStrategies = config.createMergeStrategies(router);
    const computed: Record<string, Function> = {};
    const vm: any = {
      _isReactViewRoot: false,
      $computed: jest.fn((_target, key, fn) => { computed[key] = fn; }),
      $root: { $route: { matched: [{ path: '/' }, { path: '/child' }] } },
    };
    router.getHostRouterView = jest.fn((_instance, predicate) => {
      expect(predicate({ _isReactViewRoot: false })).toBe(true);
      expect(predicate({ _isReactViewRoot: true })).toBe(false);
      return { state: { depth: 1 } } as any;
    });

    mergeStrategies(null, null, vm);
    vm.$route = computed.$route.call(vm);
    expect(vm.$route).toBe(vm.$root.$route);
    vm.$routeIndex = computed.$routeIndex.call(vm);
    expect(vm.$routeIndex).toBe(1);
    expect(computed.$routeIndex.call(vm)).toBe(1);
    expect(computed.$matchedRoute.call(vm)).toEqual({ path: '/child' });
    router.stop();
  });

  it('应注册并清理 ReactView root app 实例', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    class App {}
    router.Apps = [App as any];
    let unmount: Function = () => {};
    const vm: any = Object.assign(new App(), {
      _isReactViewRoot: true,
      $on: jest.fn((_event, callback) => { unmount = callback; }),
    });
    const mergeStrategies = config.createMergeStrategies(router);

    expect(mergeStrategies('parent', 'child', vm)).toBe('parent');
    expect(router.apps).toContain(vm);
    unmount();
    expect(router.apps).not.toContain(vm);
    expect(mergeStrategies('parent', 'child', {
      _isReactViewRoot: true,
      $on: jest.fn(),
    })).toBe('parent');
    router.stop();
  });

  it('应处理没有 root route 或宿主 RouterView 的实例', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const computed: Record<string, Function> = {};
    const vm: any = {
      _isReactViewRoot: false,
      $root: null,
      $computed: (_target: any, key: string, fn: Function) => { computed[key] = fn; },
    };
    router.getHostRouterView = jest.fn(() => null);
    config.createMergeStrategies(router)(null, null, vm);

    expect(computed.$route.call(vm)).toBeNull();
    expect(computed.$routeIndex.call(vm)).toBe(-1);
    vm.$route = null;
    vm.$routeIndex = -1;
    expect(computed.$matchedRoute.call(vm)).toBeNull();
    router.stop();
  });
});
