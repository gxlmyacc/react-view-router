export type ApiCategory = 'router'|'components'|'hooks'|'configuration';

export interface ApiReferenceItem {
  name: string;
  category: ApiCategory;
  description: string;
  examplePath?: string;
  details?: string[];
}

export const apiCategories: ApiCategory[] = ['router', 'components', 'hooks', 'configuration'];

export const apiReferenceItems: ApiReferenceItem[] = [
  {
    name: 'router.push / router.replace',
    category: 'router',
    description: 'apiPushDescription',
    examplePath: '/examples/basic-navigation',
  },
  {
    name: 'router.redirect',
    category: 'router',
    description: 'apiRedirectDescription',
    examplePath: '/examples/guard-navigation',
  },
  {
    name: 'router.go / back / forward',
    category: 'router',
    description: 'apiHistoryNavigationDescription',
    examplePath: '/examples/state-calculator',
  },
  {
    name: 'backIfVisited',
    category: 'router',
    description: 'apiBackIfVisitedDescription',
    examplePath: '/examples/history-stack',
  },
  {
    name: 'beforeEach / beforeResolve / afterEach',
    category: 'router',
    description: 'apiGuardsDescription',
    examplePath: '/examples/guards',
  },
  {
    name: 'replaceState / updateRouteMeta',
    category: 'router',
    description: 'apiMutationDescription',
    examplePath: '/examples/hooks-meta',
  },
  {
    name: 'RouterView',
    category: 'components',
    description: 'apiRouterViewDescription',
    examplePath: '/examples/basic-navigation',
  },
  {
    name: 'RouterLink',
    category: 'components',
    description: 'apiRouterLinkDescription',
    examplePath: '/examples/basic-navigation',
  },
  {
    name: 'KeepAlive',
    category: 'components',
    description: 'apiKeepAliveDescription',
    examplePath: '/examples/keep-alive',
    details: [
      'apiKeepAliveDetailConfig',
      'apiKeepAliveDetailLifecycle',
      'apiKeepAliveDetailRuntime',
    ],
  },
  {
    name: 'Transition RouterView',
    category: 'components',
    description: 'apiTransitionDescription',
    examplePath: '/examples/route-transition',
  },
  {
    name: 'useRouter / useRoute',
    category: 'hooks',
    description: 'apiCoreHooksDescription',
    examplePath: '/examples/hooks-meta',
  },
  {
    name: 'useRouteParams / useRouteQuery / useRouteState',
    category: 'hooks',
    description: 'apiDataHooksDescription',
    examplePath: '/examples/hooks-meta',
  },
  {
    name: 'useMatchedRoute / useRouteMeta',
    category: 'hooks',
    description: 'apiMatchedHooksDescription',
    examplePath: '/examples/hooks-meta',
  },
  {
    name: 'useManualRouter',
    category: 'hooks',
    description: 'apiManualRouterDescription',
    examplePath: '/architecture',
  },
  {
    name: 'useRouteTitle',
    category: 'hooks',
    description: 'apiRouteTitleDescription',
    examplePath: '/examples/hooks-meta',
  },
  {
    name: 'normalizeRoutes / walkConfigRoutes',
    category: 'configuration',
    description: 'apiRouteConfigDescription',
    examplePath: '/route-config',
  },
  {
    name: 'index / redirect',
    category: 'configuration',
    description: 'apiIndexRedirectDescription',
    examplePath: '/examples/index-redirect',
  },
  {
    name: 'paramsProps / queryProps / defaultProps',
    category: 'configuration',
    description: 'apiRoutePropsDescription',
    examplePath: '/examples/query-refresh',
  },
  {
    name: 'lazyImport',
    category: 'configuration',
    description: 'apiLazyImportDescription',
    examplePath: '/route-config',
  },
  {
    name: 'browser / hash / memory history',
    category: 'configuration',
    description: 'apiHistoryModeDescription',
    examplePath: '/examples/memory-routing',
  },
  {
    name: 'ReactViewRoutePlugin',
    category: 'configuration',
    description: 'apiPluginDescription',
    details: [
      'apiPluginDetailInstall',
      'apiPluginDetailEvents',
      'apiPluginDetailDispose',
    ],
  },
  {
    name: 'collectHydratableRoutes',
    category: 'configuration',
    description: 'apiHydrationDescription',
    details: [
      'apiHydrationDetailCollect',
      'apiHydrationDetailMatch',
      'apiHydrationDetailBoundary',
    ],
  },
];
