import RouterDrawer from '../../drawer/src/index';
import * as drawerEntry from '../../drawer/src/index';

describe('RouterDrawer 导出', () => {
  it('默认导出应为 forwardRef 包装组件', () => {
    expect(RouterDrawer).toBeDefined();
    expect((RouterDrawer as any).$$typeof).toBeDefined();
  });

  it('不再导出旧的继承类', () => {
    expect(Object.keys(drawerEntry)).toEqual(['default']);
  });
});
