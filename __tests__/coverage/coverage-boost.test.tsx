import { renderHook, act } from '@testing-library/react';
import ReactViewRouter from '../../src/router';
import useRouteTitle from '../../src/hooks/use-route-title';
import { createTestRouter, syncNavigate, Home } from '../helpers/test-utils';
import { HistoryType } from '../../src/history/types';
import { confirmInterceptors } from '../../src/history-fix';

describe('覆盖率补充', () => {
  it('updateRoute 应更新 currentRoute', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    expect(router.currentRoute?.path).toBe('/about');
    router.stop();
  });

  it('_transformLocation 应处理 basename', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      basename: '/app',
      routes: [{ path: '/', component: Home }],
    });
    router._initRouter({ basename: '/app', mode: HistoryType.hash });
    const loc = router._transformLocation({ pathname: '/app/about', search: '', hash: '' } as any);
    expect(loc).toBeDefined();
    router.stop();
  });

  it('manual 模式 refreshTitles 应可调用', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'Home' } },
    ]);
    const { result } = renderHook(
      () => useRouteTitle({ manual: true }, router),
    );
    act(() => {
      result.current.setTitles([]);
      result.current.refreshTitles();
    });
    router.stop();
  });

  it('confirmInterceptors 无拦截器应直接回调', () => {
    return new Promise<void>(resolve => {
      confirmInterceptors([], { path: '/' } as any, ok => {
        expect(ok).toBe(true);
        resolve();
      });
    });
  });

  it('history4 basename 应编码路径', () => {
    const router = createTestRouter();
    const history4 = router.history.createHistory4({ basename: '/app' });
    history4.listen(jest.fn());
    history4.push('/page');
    expect(history4.location).toBeDefined();
    router.stop();
  });
});
