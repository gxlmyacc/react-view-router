import { RouterViewComponent } from '../../src/router-view';
import { createTestRouter } from '../helpers/test-utils';

describe('RouterView 语句覆盖补充', () => {
  it('shouldComponentUpdate 忽略 onRouteChange 等 props 变化', () => {
    const router = createTestRouter();
    const view = new (RouterViewComponent as any)({ router });
    view._isMounted = true;
    view.state = { router, inited: true, resolving: false, routes: router.routes, currentRoute: null };
    const nextProps = { ...view.props, onRouteChange: jest.fn(), beforeEach: jest.fn() };
    expect(view.shouldComponentUpdate(nextProps, view.state)).toBe(false);
    router.stop();
  });

  it('componentDidMount 无父级 RouterView 应抛错', async () => {
    const view = new (RouterViewComponent as any)({});
    view._isMounted = true;
    view._reactInternals = { return: null };
    await expect(view.componentDidMount()).rejects.toThrow(/cannot find root RouterView/);
  });
});
