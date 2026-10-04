import ReactViewRouter from 'react-view-router';
import type { ReactViewRouterOptions } from 'react-view-router';
import routes from '../examples/route-guards/routes';
import { configureGuardRuntime, getGuardStore } from '../examples/route-guards/runtime';
import { afterEach, beforeEach, beforeResolve } from '../examples/route-guards/global-guards';
import type { GuardRuntimeOptions } from '../examples/route-guards/runtime';

export interface DemoRouterOptions extends ReactViewRouterOptions, GuardRuntimeOptions {}

function registerGlobalGuards(router: ReactViewRouter): void {
  router.beforeEach(beforeEach);
  router.beforeResolve(beforeResolve);
  router.afterEach(afterEach);
}

export function createDemoRouter(options: DemoRouterOptions = {}): ReactViewRouter {
  configureGuardRuntime(options);
  const router = new ReactViewRouter({
    manual: options.manual,
    mode: options.mode,
    basename: options.basename,
    pathname: options.pathname,
    renderUtils: options.renderUtils,
    routes,
  });
  router.demoStore = getGuardStore();
  registerGlobalGuards(router);
  return router;
}

export function createWorkspaceRouter(options: DemoRouterOptions = {}): ReactViewRouter {
  const workspaceRouter = new ReactViewRouter({
    mode: options.mode,
    pathname: options.pathname,
    renderUtils: options.renderUtils,
    routes: [
      { path: '/', exact: true, redirect: '/examples/guards' },
      { path: '/examples/guards', component: () => null },
    ],
  });
  const guardRouter = createDemoRouter({
    ...options,
    mode: workspaceRouter.history,
    basename: '/examples/guards',
  });
  guardRouter.workspaceRouter = workspaceRouter;
  return guardRouter;
}
