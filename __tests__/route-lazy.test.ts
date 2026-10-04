import React from 'react';
import {
  RouteLazy,
  lazyImport,
  isRouteLazy,
  isPromise,
  hasRouteLazy,
  hasMatchedRouteLazy,
} from '../src/route-lazy';

describe('route-lazy', () => {
  const MockComponent = () => React.createElement('div', null, 'lazy');

  describe('RouteLazy', () => {
    it('应通过 Promise 解析组件', async () => {
      const lazy = new RouteLazy(Promise.resolve(MockComponent));
      const component = await lazy.toResolve({} as any, {} as any, 'default');
      expect(component).toBe(MockComponent);
    });

    it('应直接解析同步组件', async () => {
      const lazy = new RouteLazy(MockComponent);
      const component = await lazy.toResolve({} as any, {} as any, 'default');
      expect(component).toBe(MockComponent);
    });

    it('应解析 ES Module 默认导出', async () => {
      const esModule = { __esModule: true, default: MockComponent };
      const lazy = new RouteLazy(Promise.resolve(esModule as any));
      const component = await lazy.toResolve({} as any, {} as any, 'default');
      expect(component).toBe(MockComponent);
    });

    it('已解析后应直接返回缓存结果', async () => {
      const importFn = jest.fn(() => Promise.resolve(MockComponent));
      const lazy = lazyImport(importFn);
      await lazy.toResolve({} as any, {} as any, 'default');
      await lazy.toResolve({} as any, {} as any, 'default');
      expect(importFn).toHaveBeenCalledTimes(1);
    });

    it('组件为 null 时应 reject', async () => {
      const lazy = lazyImport(() => Promise.resolve(null as any));
      await expect(lazy.toResolve({} as any, {} as any, 'default')).rejects.toThrow('component should not null!');
    });

    it('render 未解析时应返回 null', () => {
      const lazy = new RouteLazy(Promise.resolve(MockComponent));
      expect(lazy.render({}, null)).toBeNull();
    });

    it('render 已解析时应渲染组件', async () => {
      const lazy = new RouteLazy(MockComponent);
      await lazy.toResolve({} as any, {} as any, 'default');
      const element = lazy.render({ id: '1' }, null);
      expect(React.isValidElement(element)).toBe(true);
    });

    it('updater 应在解析时调用', async () => {
      const updater = jest.fn((comp: any) => comp);
      const lazy = new RouteLazy(MockComponent);
      lazy.updaters.push(updater);
      await lazy.toResolve({} as any, {} as any, 'default');
      expect(updater).toHaveBeenCalled();
      expect(updater.mock.calls[0][0]).toBe(MockComponent);
    });
  });

  describe('lazyImport', () => {
    it('应创建 RouteLazy 实例并标记 import 方法', () => {
      const importFn = () => Promise.resolve(MockComponent);
      const lazy = lazyImport(importFn);
      expect(lazy).toBeInstanceOf(RouteLazy);
      expect((importFn as any).__lazyImportMethod).toBe(true);
    });

    it('空 options 使用安全默认值', () => {
      const lazy = lazyImport((() => Promise.resolve(MockComponent)) as any, null as any);
      expect(lazy.options).toEqual({});
    });

    it('应通过 lazyImport 方法加载', async () => {
      const importFn = jest.fn(() => Promise.resolve(MockComponent));
      const lazy = lazyImport(importFn);
      const component = await lazy.toResolve({} as any, {} as any, 'default');
      expect(importFn).toHaveBeenCalled();
      expect(component).toBe(MockComponent);
    });
  });

  describe('类型判断', () => {
    it('isRouteLazy 应识别 RouteLazy 实例', () => {
      expect(isRouteLazy(new RouteLazy(MockComponent))).toBe(true);
      expect(isRouteLazy(MockComponent)).toBeFalsy();
    });

    it('isPromise 应识别 Promise', () => {
      expect(isPromise(Promise.resolve(1))).toBeTruthy();
      expect(isPromise(1)).toBeFalsy();
    });
  });

  describe('hasRouteLazy / hasMatchedRouteLazy', () => {
    it('应检测路由中的懒加载组件', () => {
      const componentLazy = new RouteLazy(MockComponent);
      expect(hasRouteLazy({ components: componentLazy } as any)).toBe(true);
      const route = { components: { default: new RouteLazy(MockComponent) } };
      expect(hasRouteLazy(route as any)).toBe(true);

      const normalRoute = { components: { default: MockComponent } };
      expect(hasRouteLazy(normalRoute as any)).toBe(false);
      expect(hasRouteLazy({} as any)).toBe(false);
      expect(hasRouteLazy({ components: {} } as any)).toBe(false);
    });

    it('hasMatchedRouteLazy 应检测 matched 数组', () => {
      const matched = [{ config: { components: { default: new RouteLazy(MockComponent) } } }];
      expect(hasMatchedRouteLazy(matched as any)).toBe(true);
      expect(hasMatchedRouteLazy([])).toBe(false);
      expect(hasMatchedRouteLazy(undefined as any)).toBeUndefined();
    });
  });
});
