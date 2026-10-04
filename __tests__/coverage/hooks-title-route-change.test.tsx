import { readRouteTitles, findTitleByMatchedPath } from '../../src/hooks/use-route-title';
import { createTestRouter, Home, About } from '../helpers/test-utils';

describe('useRouteTitle 路由变更联动', () => {
  it('findTitleByMatchedPath 应递归匹配子路径', () => {
    const router = createTestRouter();
    const titles = readRouteTitles(router, [
      {
        path: '/p',
        component: Home,
        meta: { title: '父' },
        children: [{ path: '/p/c', component: About, meta: { title: '子' } }],
      } as any,
    ]);
    const matchedTitles: NonNullable<ReturnType<typeof findTitleByMatchedPath>>[] = [];
    const found = findTitleByMatchedPath('/p/c', titles, matchedTitles);
    expect(found?.title).toBe('子');
    expect(matchedTitles.some(t => t.title === '父')).toBe(true);
    router.stop();
  });
});
