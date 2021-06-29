
import { Location, History, State, HashType } from './history';
import { RouteLazy } from './route-lazy';
import ReactViewRouter from './router';

export type RouteEvent = (ok: boolean, to: Route | null) => void;

export type ReactViewRouterMode = 'hash' | 'browser' | 'memory';

export type RouteInterceptorCallback = (ok: boolean) => void;

export type RouteInterceptor = (
  location: RouteHistoryLocation,
  callback: (ok: boolean | RouteInterceptorCallback) => void
) => void;

export type RouteInterceptorItem = { interceptor: RouteInterceptor, router: ReactViewRouter | null };

export interface HistoryStackInfo {
  pathname: string,
  search: string,
  index: number,
  timestamp: number,
}

export interface HistoryFix extends History {
  isHistoryInstance: boolean,
  interceptors: RouteInterceptorItem[],
  stacks: HistoryStackInfo[],
  _unblock?: () => void;

  interceptorTransitionTo: (interceptor: RouteInterceptor, router: ReactViewRouter) => () => void
  destroy?: () => void;
}

export interface NormalizeRouteOptions {
  force?: boolean
}

export interface ReactViewRouterOptions extends Partial<any> {
  name?: string,
  basename?: string,
  mode?: ReactViewRouterMode,
  manual?: boolean,
  rememberInitialRoute?: boolean,
  inheritProps?: boolean,
  routes?: ConfigRouteArray,
  hashType?: HashType,
  install?: (vuelike: any, options: { App?: any }) => void
}

export type RouteNextResult = boolean | Error | Function | string | null | RouteLocation;

export type RouteRedirectFn = (this: ConfigRoute, from?: Route) => string;
export type RouteIndexFn = (routes: ConfigRouteArray) => string;
export type RouteNextFn = (ok?: RouteNextResult, ...args: any[]) => void;
export type RouteChildrenFn = () => UserConfigRoute[] | ConfigRouteArray;
export type RouteErrorCallback = (error: Error) => void;

export type RouteResolveNameFn = (name: string, options: any, router: ReactViewRouter, to?: RouteHistoryLocation) => string|null|void;

export interface RouteBeforeGuardFn {
  (to: Route, from: Route | null, next: RouteNextFn, route?: MatchedRoute): void;
  route?: MatchedRoute;
  global?: boolean;
}
export interface RouteAfterGuardFn {
  (to: Route, from: Route | null, route?: MatchedRoute): void;
  route?: MatchedRoute;
  global?: boolean;
}
export type RouteGuardInterceptor = RouteBeforeGuardFn | RouteAfterGuardFn | lazyResovleFn;
export type RouteBindInstanceFn = (fn: RouteGuardInterceptor, name: string, ci?: any, r?: MatchedRoute)
  => RouteGuardInterceptor | null;

export type RouteLocation = {
  path?: string,
  query?: Partial<any>,
  params?: Partial<any>,
  append?: boolean,
  absolute?: boolean | ReactViewRouterMode,
  delta?: number,
  route?: ConfigRoute,
  backIfVisited?: boolean;
  _routeNormalized?: boolean;
}

export interface RouteHistoryLocation<S extends State = State> extends Location<S> {
  basename?: string,
  path: string,
  fullPath: string,
  query: Partial<any>,
  delta: number,
  absolute?: boolean,
  isReplace: boolean,
  isRedirect: boolean,
  onComplete?: RouteEvent,
  onAbort?: RouteEvent,
  onInit?: RouteEvent,
  redirectedFrom?: Route | null,
  _routeNormalized?: boolean;
}

export interface RouteGuardsInfo extends Partial<any> {
  beforeRouteLeave?: RouteBeforeGuardFn,
  afterRouteEnter?: RouteAfterGuardFn,
  afterRouteLeave?: RouteAfterGuardFn,
  beforeRouteUpdate?: RouteAfterGuardFn,
}

export interface RouteGuardsInfoHOC extends RouteGuardsInfo {
  componentClass?: React.ComponentType,
  children?: any,

  beforeRouteEnter?: RouteBeforeGuardFn,
}

export interface RouteGuardsInfoHooks extends RouteGuardsInfo {
  __routeGuardInfoHooks: true,
}


export interface RouteLazyUpdater {
  (component: (React.ComponentType) & {
    __children?: any[] | ((r: any) => any[])
  }):
    React.ComponentType | undefined;
}

export type matchPathResult = {
  path: string,
  url: string,
  regx: RegExp,
  isExact?: boolean,
  params: Partial<any>,
}

export interface CommonRoute {
  path: string,
  name?: string,
  index?: string | RouteIndexFn,
  redirect?: string | RouteRedirectFn,
  [key: string]: any
}

export interface UserConfigRoute extends CommonRoute {
  exact?: boolean,

  parent?: ConfigRoute,
  children?: UserConfigRoute[] | ConfigRouteArray | RouteChildrenFn,
  component?: React.ComponentType| RouteLazy,
  components?: {
    default?: any,
    [key: string]: any
  },
  props?: Partial<any>,
  paramsProps?: Partial<any>,
  queryProps?: Partial<any>,
  meta?: Partial<any>,
  [guardName: string]: any | ((to: Route, from: Route, next?: RouteNextFn) => void)
}

export interface ConfigRoute extends UserConfigRoute {
  subpath: string,
  depth: number,
  components: {
    default?: any,
    [key: string]: any
  },
  meta: Partial<any>,
  children: ConfigRouteArray | RouteChildrenFn,

  _pending: {
    completeCallbacks: {
      [key: string]: ((ci: any) => any) | null;
    },
  },
}

export type matchRoutesResult = {
  match: matchPathResult,
  route: ConfigRoute
};


export interface MatchedRoute extends CommonRoute {
  subpath: string,
  depth: number,
  config: ConfigRoute,
  params: Partial<any>,
  meta: Partial<any>,
  regx: RegExp,
  componentInstances: {
    [key: string]: any
  },
  viewInstances: {
    [key: string]: any
  }
}

export interface MatchedRouteArray extends Array<MatchedRoute> {
  unmatchedPath: string
}

export interface Route {
  action: string,
  url: string,
  basename: string,
  path: string,
  fullPath: string,
  search: string,
  isRedirect: boolean,
  isReplace: boolean,
  query: Partial<any>,
  params: Partial<any>,
  matched: MatchedRoute[],
  matchedPath: string,
  meta: Partial<any>,
  delta: number,
  state: Partial<any>,

  onAbort?: RouteEvent,
  onComplete?: RouteEvent,
  onInit?: RouteEvent,
  redirectedFrom?: Route,
  isViewRoute: true
}

export interface ConfigRouteArray extends Array<ConfigRoute> {
  _normalized?: boolean;
}

export type onRouteChangeEvent = (route: Route, prevRoute: Route, router: ReactViewRouter) => void;
export type onRouteMetaChangeEvent = (newVal: any, oldVal: any, route: ConfigRoute, router: ReactViewRouter) => void;

export interface ReactViewRoutePlugin {
  name?: string;
  install?(router: any): void;
  uninstall?(router: any): void;

  onRouteEnterNext?(route: MatchedRoute, ci: React.Component, prevRes: any): void;
  onRouteLeaveNext?(route: MatchedRoute, ci: React.Component, prevRes: any): void;
  onRouteing?(isRouting: boolean): void;
  onRouteChange?: onRouteChangeEvent;
  onRouteMetaChange?: onRouteMetaChangeEvent;
  onResolveComponent?(
    nc: React.ComponentType,
    route: ConfigRoute
  ): React.ComponentType | undefined;
  onWalkRoute?(route: ConfigRoute, routeIndex: number, routes: ConfigRouteArray): void;

  [event: string]: any | ((...args: any[]) => any);
}

export interface lazyResovleFn {
  (interceptors: RouteGuardInterceptor[], index: number): Promise<RouteBeforeGuardFn>,
  lazy?: boolean,
  route?: MatchedRoute
}

export interface VuelikeComponent  {
  _willUnmount(): void;

  readonly $route: Route | null;
  readonly $routeIndex: number;
  readonly $matchedRoute: MatchedRoute | null;

  flow(fn: Function): Function;
}

declare global {

  interface EsModule extends NodeModule {
    __esModule?: boolean;
    default: any
  }

  const __packageversion__: string|undefined|((packageName: string) => string);
}
