import { normalizeRoutes, lazyImport } from 'react-view-router';

const contentPage = (
  name: 'HomePage'|'QuickStartPage'|'ArchitecturePage'|'RouteConfigPage'|'FeatureIndexPage'|'CompatibilityPage',
) => lazyImport(
  () => import(/* webpackChunkName: "demo-site-pages" */ './pages/ContentPages')
    .then(module => module[name]),
);

const routes = normalizeRoutes([
  { path: '/', index: '/home' },
  {
    path: '/home',
    component: contentPage('HomePage'),
    meta: {
      title: 'home',
      site: { section: 'overview', order: 10, topNav: true, tab: true, closable: false },
    },
  },
  {
    path: '/quick-start',
    component: contentPage('QuickStartPage'),
    meta: {
      title: 'quickStart',
      site: { section: 'guides', order: 20, topNav: true, tab: true },
    },
  },
  {
    path: '/architecture',
    component: contentPage('ArchitecturePage'),
    meta: {
      title: 'architecture',
      site: { section: 'guides', order: 30, topNav: true, tab: true },
    },
  },
  {
    path: '/route-config',
    component: contentPage('RouteConfigPage'),
    meta: {
      title: 'routeConfig',
      site: { section: 'guides', order: 40, tab: true },
    },
  },
  {
    path: '/features',
    component: contentPage('FeatureIndexPage'),
    meta: {
      title: 'featureIndex',
      site: { section: 'guides', order: 50, tab: true },
    },
  },
  {
    path: '/api',
    component: lazyImport(() => import(/* webpackChunkName: "demo-api-reference" */ './pages/ApiReferencePage')),
    meta: {
      title: 'apiReference',
      site: { section: 'guides', order: 60, topNav: true, tab: true },
    },
  },
  {
    path: '/playground',
    component: lazyImport(() => import(/* webpackChunkName: "demo-playground" */ '../playground/PlaygroundPage')),
    meta: {
      title: 'playground',
      site: { section: 'guides', order: 70, tab: true },
    },
  },
  {
    path: '/examples/basic-navigation',
    component: lazyImport(() => import(/* webpackChunkName: "demo-basic-navigation" */ '../examples/basic-navigation/App')),
    defaultProps: { basename: '/examples/basic-navigation' },
    meta: {
      title: 'basicNavigation',
      site: {
        section: 'examples', order: 80, topNav: true, navTitle: 'demos', tab: true,
      },
      example: {
        description: 'basicNavigationDescription',
        scenarios: [
          'basicNavigationScenarioLinks',
          'basicNavigationScenarioProps',
          'basicNavigationScenarioProgrammatic',
          'basicNavigationScenarioAbsolute',
        ],
        apis: [
          'RouterLink', 'RouterView props', 'paramsProps', 'matched.metaComputed',
          'router.push', 'router.replace', 'absolute', 'useRoute',
        ],
        source: 'demo_react_shared/src/examples/basic-navigation',
      },
    },
  },
  {
    path: '/examples/query-refresh',
    component: lazyImport(() => import(/* webpackChunkName: "demo-query-refresh" */ '../examples/query-refresh/App')),
    defaultProps: { basename: '/examples/query-refresh' },
    meta: {
      title: 'queryRefresh',
      site: { section: 'examples', order: 90, tab: true },
      example: {
        description: 'queryRefreshDescription',
        scenarios: ['queryRefreshScenarioPermission', 'queryRefreshScenarioProps'],
        apis: ['queryProps', 'useRouteQuery', 'router.push'],
        source: 'demo_react_shared/src/examples/query-refresh',
      },
    },
  },
  {
    path: '/examples/index-redirect',
    component: lazyImport(() => import(/* webpackChunkName: "demo-index-redirect" */ '../examples/index-redirect/App')),
    defaultProps: { basename: '/examples/index-redirect' },
    meta: {
      title: 'indexRedirect',
      site: { section: 'examples', order: 100, tab: true },
      example: {
        description: 'indexRedirectDescription',
        scenarios: ['indexRedirectScenarioIndex', 'indexRedirectScenarioRedirect'],
        apis: ['index', 'redirect', 'currentRoute', 'history.location'],
        source: 'demo_react_shared/src/examples/index-redirect',
      },
    },
  },
  {
    path: '/examples/state-calculator',
    component: lazyImport(() => import(/* webpackChunkName: "demo-state-calculator" */ '../examples/state-calculator/App')),
    defaultProps: { basename: '/examples/state-calculator' },
    meta: {
      title: 'stateCalculator',
      site: { section: 'examples', order: 110, tab: true },
      example: {
        description: 'stateCalculatorDescription',
        scenarios: ['stateCalculatorScenarioSubmit', 'stateCalculatorScenarioHistory'],
        apis: ['router.push({ state })', 'useRouteState', 'router.back'],
        source: 'demo_react_shared/src/examples/state-calculator',
      },
    },
  },
  {
    path: '/examples/guards',
    component: lazyImport(() => import(/* webpackChunkName: "demo-route-guards" */ '../examples/route-guards/App')),
    defaultProps: { basename: '/examples/guards' },
    meta: {
      title: 'routeGuards',
      site: { section: 'examples', order: 120, tab: true },
      example: {
        description: 'routeGuardsDescription',
        scenarios: ['routeGuardsScenarioOrder', 'routeGuardsScenarioModules'],
        apis: ['beforeEach', 'beforeResolve', 'afterEach', 'beforeRouteEnter'],
        source: 'demo_react_shared/src/examples/route-guards',
      },
    },
  },
  {
    path: '/examples/guard-navigation',
    component: lazyImport(() => import(/* webpackChunkName: "demo-guard-navigation" */ '../examples/guard-navigation/App')),
    defaultProps: { basename: '/examples/guard-navigation' },
    meta: {
      title: 'guardNavigation',
      site: { section: 'examples', order: 130, tab: true },
      example: {
        description: 'guardNavigationDescription',
        scenarios: [
          'guardNavigationScenarioSharedHelper',
          'guardNavigationScenarioIgnoredNext',
          'guardNavigationScenarioAbort',
        ],
        apis: ['beforeEach', 'beforeRouteEnter', 'router.push', 'router.replace', 'router.redirect', 'Promise', 'next(false)'],
        source: 'demo_react_shared/src/examples/guard-navigation',
      },
    },
  },
  {
    path: '/examples/memory-routing',
    component: lazyImport(() => import(/* webpackChunkName: "demo-memory-routing" */ '../examples/memory-routing/App')),
    meta: {
      title: 'memoryRouting',
      site: { section: 'examples', order: 140, tab: true },
      example: {
        description: 'memoryRoutingDescription',
        scenarios: ['memoryRoutingScenarioOwned', 'memoryRoutingScenarioExternal'],
        apis: ['HistoryType.memory', 'useManualRouter', 'RouterView', 'history'],
        source: 'demo_react_shared/src/examples/memory-routing',
      },
    },
  },
  {
    path: '/examples/history-stack',
    component: lazyImport(() => import(/* webpackChunkName: "demo-history-stack" */ '../examples/history-stack/App')),
    defaultProps: { basename: '/examples/history-stack' },
    meta: {
      title: 'historyStack',
      site: { section: 'examples', order: 150, tab: true },
      example: {
        description: 'historyStackDescription',
        scenarios: ['historyStackScenarioIframe', 'historyStackScenarioBack'],
        apis: ['backIfVisited', 'navigation.traverseTo', 'router.stacks', 'router.push'],
        source: 'demo_react_shared/src/examples/history-stack',
      },
    },
  },
  {
    path: '/examples/route-transition',
    component: lazyImport(() => import(/* webpackChunkName: "demo-route-transition" */ '../examples/route-transition/App')),
    defaultProps: { basename: '/examples/route-transition' },
    meta: {
      title: 'routeTransition',
      site: { section: 'examples', order: 160, tab: true },
      example: {
        description: 'routeTransitionDescription',
        scenarios: ['routeTransitionScenarioModes', 'routeTransitionScenarioDirection', 'routeTransitionScenarioContainer'],
        apis: ['react-view-router/transition', 'transition', 'transitionFallback', 'router.back'],
        source: 'demo_react_shared/src/examples/route-transition',
      },
    },
  },
  {
    path: '/examples/save-position',
    component: lazyImport(() => import(/* webpackChunkName: "demo-save-position" */ '../examples/save-position/App')),
    defaultProps: { basename: '/examples/save-position' },
    meta: {
      title: 'savePositionDemo',
      site: { section: 'examples', order: 162, tab: true },
      example: {
        description: 'savePositionDescription',
        scenarios: ['positionScenarioReturn', 'positionScenarioDisable', 'positionScenarioTransition'],
        apis: ['meta.savePosition', 'getContainerRef', 'renderUtils', 'router.back'],
        source: 'demo_react_shared/src/examples/save-position',
      },
    },
  },
  {
    path: '/examples/keep-alive',
    component: lazyImport(() => import(/* webpackChunkName: "demo-keep-alive" */ '../examples/keep-alive/App')),
    defaultProps: { basename: '/examples/keep-alive' },
    meta: {
      title: 'keepAliveDemo',
      site: { section: 'examples', order: 165, tab: true },
      example: {
        description: 'keepAliveDescription',
        scenarios: ['keepAliveScenarioDraft', 'keepAliveScenarioLifecycle', 'keepAliveScenarioAnimation'],
        apis: ['keepAlive', 'renderUtils', 'useViewActivate', 'useViewDeactivate', 'react-view-router/transition'],
        source: 'demo_react_shared/src/examples/keep-alive',
      },
    },
  },
  {
    path: '/examples/drawer',
    component: lazyImport(() => import(/* webpackChunkName: "demo-drawer" */ '../examples/drawer/App')),
    defaultProps: { basename: '/examples/drawer' },
    meta: {
      title: 'drawerDemo',
      site: { section: 'examples', order: 167, tab: true },
      example: {
        description: 'drawerDescription',
        scenarios: ['drawerScenarioOpen', 'drawerScenarioClose'],
        apis: ['react-view-router/drawer', 'RouterDrawer', 'componentWillUnactivate', 'componentDidActivate', 'router.push', 'router.replace'],
        source: 'demo_react_shared/src/examples/drawer',
      },
    },
  },
  {
    path: '/examples/hooks-meta',
    component: lazyImport(() => import(/* webpackChunkName: "demo-hooks-meta" */ '../examples/hooks-meta/App')),
    defaultProps: { basename: '/examples/hooks-meta' },
    meta: {
      title: 'hooksMeta',
      site: { section: 'examples', order: 170, tab: true },
      example: {
        description: 'hooksMetaDescription',
        scenarios: [
          'hooksMetaScenarioTitleNavigation',
          'hooksMetaScenarioNavigation',
          'hooksMetaScenarioMutation',
        ],
        apis: [
          'useRouter', 'useRoute', 'useRouteParams', 'useRouteQuery', 'useRouteState',
          'useRouteMeta', 'useMatchedRouteAndIndex', 'useRouterView', 'useRouteTitle',
        ],
        source: 'demo_react_shared/src/examples/hooks-meta',
      },
    },
  },
  {
    path: '/compatibility',
    component: contentPage('CompatibilityPage'),
    meta: {
      title: 'compatibility',
      site: { section: 'guides', order: 180, topNav: true, tab: true },
    },
  },
]);

export default routes;
