import config, { parseQuery } from '../../src/config';
import ReactViewRouter from '../../src/router';
import { HistoryType } from '../../src/history/types';
import { createTestRouter } from '../helpers/test-utils';

describe('config 深度覆盖', () => {
  it('parseQuery 自定义解析器抛错时应捕获', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = parseQuery('?bad=1', {
      bad: () => { throw new Error('parse error'); },
    });
    expect(result.bad).toBe('1');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('createMergeStrategies 应处理 _isReactViewRoot 分支', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    class AppClass {}
    router.Apps = [AppClass as any];
    const merge = config.createMergeStrategies(router);
    const vm: any = Object.create(AppClass.prototype);
    vm._isReactViewRoot = true;
    vm.$on = jest.fn((event: string, cb: Function) => {
      if (event === 'componentDidUnmount') vm._unmount = cb;
    });
    merge(null, null, vm);
    expect(router.apps).toContain(vm);
    vm._unmount && vm._unmount();
    expect(router.apps).not.toContain(vm);
    router.stop();
  });

  it('createMergeStrategies 应为子组件注册 $route 计算属性', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const merge = config.createMergeStrategies(router);
    const computed: Record<string, Function> = {};
    const vm: any = {
      _isReactViewRoot: false,
      $root: { $route: { path: '/x', matched: [{ path: '/x' }] } },
      $computed: jest.fn((target, key, fn) => { computed[key] = fn; }),
      _routeIndex: 2,
    };
    merge(null, null, vm);
    expect(computed.$route.call(vm)).toEqual(vm.$root.$route);
    expect(computed.$routeIndex.call(vm)).toBe(2);
    expect(computed.$matchedRoute.call(vm)).toBeNull();
    router.stop();
  });

  it('createMergeStrategies 无 _routeIndex 时应从 RouterView 读取 depth', () => {
    const router = createTestRouter();
    const merge = config.createMergeStrategies(router);
    const computed: Record<string, Function> = {};
    const vm: any = {
      _isReactViewRoot: false,
      $computed: jest.fn((target, key, fn) => { computed[key] = fn; }),
    };
    jest.spyOn(router, 'getHostRouterView').mockReturnValue({
      state: { depth: 5 },
    } as any);
    merge(null, null, vm);
    expect(computed.$routeIndex.call(vm)).toBe(5);
    router.stop();
  });

  it('getter 应返回 parseQuery/stringifyQuery', () => {
    expect(config.parseQuery).toBe(config._parseQuery);
    expect(config.stringifyQuery).toBe(config._stringifyQuery);
  });
});
