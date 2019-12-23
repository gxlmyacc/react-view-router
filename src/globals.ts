

export type RouteEvent = (ok: boolean, to: Route) => void;

export type ReactVueRouterMode = 'hash' | 'browser' | 'history' | 'memory' | 'abstract';


export type ReactVueRouterOptions = {
  basename?: string,
  base?: string,
  mode?: ReactVueRouterMode,
  manual?: boolean,
  history?: any,
  [key: string]: any
}

export type RouteRedirectFn = (route: MatchedRoute, from: Route) => string;
export type RouteIndexFn = () => string;
export type RouteNextFn = (ok?: any, ...args: any[]) => void;
export type RouteChildrenFn = () => ConfigRoute[];
export type RouteErrorCallback = (error: Error) => void;

export interface RouteBeforeGuardFn {
  (to: Route, from: Route | null, next: RouteNextFn, route?: ConfigRoute): void;
  global?: boolean;
}
export interface RouteAfterGuardFn {
  (to: Route, from: Route | null, route?: ConfigRoute): void;
  global?: boolean;
}
export type RouteGuardInterceptor = RouteBeforeGuardFn | RouteAfterGuardFn | lazyResovleFn;
export type RouteBindInstanceFn = (fn: RouteGuardInterceptor, name: string, ci?: any, r?: ConfigRoute)
  => RouteGuardInterceptor | null;

export interface RouteHistoryLocation {
  path?: string,
  pathname: string,
  search: string,
  fullPath: string,
  query: Partial<any>,
  isReplace: boolean,
  isRedirect: boolean,
  onComplete?: RouteEvent,
  onAbort?: RouteEvent,
  onInit?: RouteEvent,
  redirectedFrom?: Route | null
}


export interface UseRouteGuardsInfo {
  componentClass?: React.FunctionComponent | React.ComponentClass,
  children?: any,

  beforeRouteEnter?: RouteBeforeGuardFn,
  beforeRouteLeave?: RouteBeforeGuardFn,
  afterRouteEnter?: RouteAfterGuardFn,
  afterRouteLeave?: RouteAfterGuardFn,
  beforeRouteUpdate?: RouteAfterGuardFn,
}

export interface RouteLazyUpdater {
  (component: (React.FunctionComponent | React.ComponentClass) & {
    __children?: any[] | ((r: any) => any[])
  }):
    React.FunctionComponent | React.ComponentClass | undefined;
}

export type matchPathResult = {
  path?: string,
  url: string,
  isExact?: boolean,
  params: Partial<any>,
}

export interface ConfigRoute {
  path: string,
  subpath: string,
  depth: number,
  exact: boolean,
  meta: Partial<any>,
  parent?: ConfigRoute,
  children?: ConfigRoute[] | RouteChildrenFn,
  component?: React.Component,
  components: {
    default?: any,
    [key: string]: any
  },
  props?: Partial<any>,
  paramsProps?: Partial<any>,
  queryProps?: Partial<any>,
  redirect?: string | RouteRedirectFn,
  index?: string | RouteIndexFn,

  _pending: {
    afterEnterGuards: {
      [key: string]: RouteAfterGuardFn[] | null
    }
    completeCallbacks: {
      [key: string]: ((ci: any) => any) | null;
    },
  }

  [guardName: string]: any | ((to: Route, from: Route, next?: RouteNextFn) => void)
}

export type matchRoutesResult = {
  match: matchPathResult,
  route: ConfigRoute
};


export type MatchedRoute = {
  path: string,
  subpath: string,
  depth: number,
  meta: Partial<any>,
  index?: string | RouteIndexFn,
  redirect?: string | RouteRedirectFn,
  config: ConfigRoute,
  params: Partial<any>,
  componentInstances: {
    [key: string]: any
  },
  viewInstances: {
    [key: string]: any
  }
  [key: string]: any
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
  meta: Partial<any>,

  onAbort?: RouteEvent,
  onComplete?: RouteEvent,
  onInit?: RouteEvent,
  redirectedFrom?: Route,
}


export interface ConfigRouteArray extends Array<ConfigRoute> {
  _normalized?: boolean;
}

export interface ReactViewRoutePlugin {
  name?: string;
  install?(router: any): void;
  uninstall?(router: any): void;

  [event: string]: any | ((...args: any[]) => any);
}

export interface lazyResovleFn {
  (interceptors: RouteGuardInterceptor[], index: number): Promise<RouteBeforeGuardFn>,
  lazy?: boolean,
  route?: ConfigRoute
}
