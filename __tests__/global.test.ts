import { REACT_VIEW_ROUTER_GLOBAL } from '../src/global';

describe('global', () => {
  it('应初始化 REACT_VIEW_ROUTER_GLOBAL', () => {
    expect(REACT_VIEW_ROUTER_GLOBAL).toBeDefined();
    expect(REACT_VIEW_ROUTER_GLOBAL.contexts).toBeDefined();
    expect(REACT_VIEW_ROUTER_GLOBAL.historys).toBeDefined();
  });

  it('globalThis 上应挂载 __REACT_VIEW_ROUTER_GLOBAL__', () => {
    expect((globalThis as any).__REACT_VIEW_ROUTER_GLOBAL__).toBe(REACT_VIEW_ROUTER_GLOBAL);
  });

  it('contexts 应可读写', () => {
    REACT_VIEW_ROUTER_GLOBAL.contexts.testKey = { foo: 1 };
    expect(REACT_VIEW_ROUTER_GLOBAL.contexts.testKey).toEqual({ foo: 1 });
    delete REACT_VIEW_ROUTER_GLOBAL.contexts.testKey;
  });

  it('historys 对象应存在', () => {
    expect(typeof REACT_VIEW_ROUTER_GLOBAL.historys).toBe('object');
  });
});
