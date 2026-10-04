import { normalizeRoutes } from 'react-view-router';
import HookReferencePage from './HookReferencePage';
import HooksInspector from './HooksInspector';
import ReportOutlet from './ReportOutlet';
import { hookGroups } from './hook-reference';

const referenceRoutes = hookGroups.map(group => ({
  path: group.path,
  component: ReportOutlet,
  meta: {
    title: group.title,
    navigation: { order: 10 },
  },
  children: [
    { path: '/', index: ':first' as const },
    ...group.hooks.map(hook => ({
      path: hook.path,
      component: HookReferencePage,
      meta: {
        title: hook.name,
        hookId: hook.name,
        navigation: {
          tab: hook.tab,
          to: `/${group.path}/${hook.path}`,
        },
      },
    })),
  ],
}));

export default normalizeRoutes([
  { path: '/', redirect: '/navigation/use-route-title' },
  ...referenceRoutes,
  {
    path: 'live',
    component: ReportOutlet,
    meta: {
      title: 'hooksLiveGroup',
      navigation: { order: 99 },
    },
    children: [
      { path: '/', index: 'inspector/monthly' },
      {
        path: 'inspector/:reportId',
        component: HooksInspector,
        meta: {
          title: 'hooksInspector',
          role: 'analyst',
          status: 'ready',
          navigation: { to: '/live/inspector/monthly?view=summary' },
          computedSummary: (_route: unknown, _routes: unknown, props: {
            router?: { currentRoute?: { params: { reportId?: string }, query: { view?: string } } },
          }) => {
            const route = props.router && props.router.currentRoute;
            return `live:${route?.params.reportId || 'unknown'}:${route?.query.view || 'summary'}`;
          },
        },
      },
    ],
  },
]);
