import { lazyImport, normalizeRoutes } from 'react-view-router';
import type {
  Route,
  RouteNextFn,
  UserConfigRoute,
} from 'react-view-router';
import Login from './pages/Login';
import Home from './pages/Home';
import { createGuardedComponent, loadGuardedComponent } from './guards/component-guards';
import { emitGuardEvent, isGuardBlocked } from './runtime';
import type { GuardOutcome } from './guard-events';

const HomeWithGuards = createGuardedComponent(Home, 'home');
const LoginWithGuards = createGuardedComponent(Login, 'login');

function recordSomeRouteGuard(
  hook: string,
  to: Route,
  from: Route | null,
  outcome: GuardOutcome,
): void {
  emitGuardEvent(`route:some:${hook}`, {
    scope: 'route', owner: 'some', hook, to, from, outcome,
  });
}

const routeConfig: UserConfigRoute[] = [
  { path: '/', index: 'home' },
  {
    path: 'home',
    component: HomeWithGuards,
    children: [
      { path: '/', index: 'main' },
      {
        path: 'main',
        component: lazyImport(() => loadGuardedComponent(
          () => import(/* webpackChunkName: "demo-main" */ './pages/Main'),
          'main',
        )),
        children: [
          {
            path: '/',
            redirect: () => ({ path: 'some', query: { aa: 1, bb: 2 } }),
          },
          {
            path: 'some',
            components: {
              default: lazyImport(() => loadGuardedComponent(
                () => import(/* webpackChunkName: "demo-some" */ './pages/Some'),
                'some',
                { enterInstanceCallback: true },
              )),
              footer: lazyImport(() => loadGuardedComponent(
                () => import(/* webpackChunkName: "demo-footer" */ './pages/Footer'),
                'footer',
                { enterInstanceCallback: true },
              )),
            },
            beforeEnter(to: Route, from: Route | null, next: RouteNextFn) {
              const blocked = isGuardBlocked('route:some', 'beforeEnter', to, from);
              recordSomeRouteGuard('beforeEnter', to, from, blocked ? 'abort' : 'continue');
              next(blocked ? false : undefined);
            },
            beforeLeave(to, from, next) {
              const blocked = isGuardBlocked('route:some', 'beforeLeave', to, from);
              recordSomeRouteGuard('beforeLeave', to, from, blocked ? 'abort' : 'continue');
              next(blocked ? false : undefined);
            },
            beforeUpdate(to, from) {
              recordSomeRouteGuard('beforeUpdate', to, from, 'continue');
            },
            afterLeave(to, from) {
              recordSomeRouteGuard('afterLeave', to, from, 'completed');
            },
          },
          {
            path: 'other',
            component: lazyImport(() => loadGuardedComponent(
              () => import(/* webpackChunkName: "demo-other" */ './pages/Other'),
              'other',
              { enterInstanceCallback: true },
            )),
          },
        ],
      },
    ],
  },
  { path: 'login', component: LoginWithGuards },
];

const routes = normalizeRoutes(routeConfig);

export default routes;
