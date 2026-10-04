import { REACT_VIEW_ROUTER_GLOBAL } from '../../src/global';

describe('global.ts', () => {
  it('REACT_VIEW_ROUTER_GLOBAL 应包含 contexts 与 historys', () => {
    expect(REACT_VIEW_ROUTER_GLOBAL.contexts).toBeDefined();
    expect(REACT_VIEW_ROUTER_GLOBAL.historys).toBeDefined();
  });

  it('contexts 缺失时应自动补全', () => {
    const saved = REACT_VIEW_ROUTER_GLOBAL.contexts;
    delete (REACT_VIEW_ROUTER_GLOBAL as { contexts?: Record<string, unknown> }).contexts;
    jest.isolateModules(() => {
      const mod = require('../../src/global');
      expect(mod.REACT_VIEW_ROUTER_GLOBAL.contexts).toEqual({});
    });
    REACT_VIEW_ROUTER_GLOBAL.contexts = saved;
  });

  it('首次加载应初始化全局单例', () => {
    const key = '__REACT_VIEW_ROUTER_GLOBAL__';
    const saved = (globalThis as Record<string, unknown>)[key];
    delete (globalThis as Record<string, unknown>)[key];
    jest.isolateModules(() => {
      const mod = require('../../src/global');
      expect((globalThis as Record<string, unknown>)[key]).toBeDefined();
      expect(mod.REACT_VIEW_ROUTER_GLOBAL.contexts).toBeDefined();
    });
    Object.defineProperty(globalThis, key, {
      value: saved,
      configurable: true,
      writable: true,
    });
  });
});
