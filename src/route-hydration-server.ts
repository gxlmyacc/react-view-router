import ReactViewRouter from './router';
import { RouteLazy, RouteLazyHydrateOptions, isRouteLazy } from './route-lazy';
import {
  ConfigRoute,
  MatchedRoute,
  NormalizedConfigRouteArray,
  ReactAllComponentType,
  UserConfigRoute,
} from './types';
import { walkConfigRoutes } from './util';
import { RouteRuntimeDescriptor, createRouteRuntimeDescriptor } from './route-runtime';
import { HistoryType } from './history';

export interface HydratableRouteInfo {
  route: ConfigRoute;
  viewName: string;
  lazy: RouteLazy;
  descriptor: RouteRuntimeDescriptor;
}

export interface MatchedHydratableRouteInfo extends HydratableRouteInfo {
  matchedRoute: MatchedRoute;
  router: ReactViewRouter;
}

export interface ResolvedHydratableRouteInfo extends MatchedHydratableRouteInfo {
  component: ReactAllComponentType;
}

type RouteList = UserConfigRoute[] | ConfigRoute[] | NormalizedConfigRouteArray;

function getHydrateOptions(lazy: RouteLazy): RouteLazyHydrateOptions {
  return lazy.options.hydrate === true
    ? {}
    : lazy.options.hydrate as RouteLazyHydrateOptions;
}

function collectRouteViews(route: ConfigRoute): HydratableRouteInfo[] {
  const result: HydratableRouteInfo[] = [];
  Object.keys(route.components).forEach((viewName) => {
    const component = route.components[viewName];
    if (!isRouteLazy(component) || !component.shouldHydrate) return;

    const options = getHydrateOptions(component);
    result.push({
      route,
      viewName,
      lazy: component,
      descriptor: createRouteRuntimeDescriptor(route, viewName, {
        owner: options.owner,
        runtime: options.runtime,
        container: options.container,
        payloadRef: options.payloadRef,
        checksum: options.checksum,
      }),
    });
  });
  return result;
}

/** Returns every discoverable `hydrate: true` route view without loading it. */
export function collectHydratableRoutes(routes: RouteList): HydratableRouteInfo[] {
  const result: HydratableRouteInfo[] = [];
  walkConfigRoutes(routes, (route) => {
    Array.prototype.push.apply(result, collectRouteViews(route));
  });
  return result;
}

function createServerRouter(routes: RouteList) {
  return new ReactViewRouter({ manual: true, mode: HistoryType.memory, routes });
}

/** Matches a request with ReactViewRouter's own nested-route matching rules. */
export function matchHydratableRoutes(
  routes: RouteList,
  requestUrl: string,
): MatchedHydratableRouteInfo[] {
  const router = createServerRouter(routes);
  const result: MatchedHydratableRouteInfo[] = [];
  router.getMatched(requestUrl).forEach((matchedRoute) => {
    collectRouteViews(matchedRoute.config).forEach((info) => {
      result.push({ ...info, matchedRoute, router });
    });
  });
  return result;
}

/** Matches and loads the hydratable components needed by one server request. */
export function resolveHydratableRoutes(
  routes: RouteList,
  requestUrl: string,
): Promise<ResolvedHydratableRouteInfo[]> {
  const router = createServerRouter(routes);
  const pending: Promise<ResolvedHydratableRouteInfo>[] = [];
  router.getMatched(requestUrl).forEach((matchedRoute) => {
    collectRouteViews(matchedRoute.config).forEach((info) => {
      pending.push(info.lazy.toResolve(router, info.route, info.viewName).then((component) => ({
        ...info,
        matchedRoute,
        router,
        component: component as ReactAllComponentType,
      })));
    });
  });
  return Promise.all(pending);
}

/** Applies the same route component wrapper on the server and in hydration. */
export function wrapHydratableRouteElement(
  routeInfo: ResolvedHydratableRouteInfo,
  element: any,
) {
  const options = getHydrateOptions(routeInfo.lazy);
  if (options.wrapElement) {
    element = options.wrapElement(element, {
      route: routeInfo.route,
      router: routeInfo.router,
      viewName: routeInfo.viewName,
      descriptor: routeInfo.descriptor,
    });
  }
  return element;
}
