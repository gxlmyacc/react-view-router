import { useContext, useState, useEffect, useCallback, useImperativeHandle, Ref, DependencyList } from 'react';
import ReactViewRouter from '../router';
import { RouterContext, RouterViewContext } from '../context';
import { RouterViewEvents, _checkActivate, _checkDeactivate } from '../router-view';
import {
  RouteGuardsInfo, Route,
  RouteGuardsInfoHooks, onRouteChangeEvent, onRouteMetaChangeEvent, ReactViewRoutePlugin, MatchedRoute
} from '../types';
import { innumerable, isFunction, isPlainObject, isNumber, readRouteMeta, isEmptyRouteState } from '../util';

function isCommonPage(matched: MatchedRoute[], commonPageName?: string) {
  return Boolean(commonPageName && matched.some(r => readRouteMeta(r.config, commonPageName)));
}

function getRouteMatched(router: ReactViewRouter|null, currentRoute: Route|null, commonPageName?: string) {
  if (!currentRoute || !router) return [];
  let { matched = [] } = currentRoute;
  if (matched) {
    const _isCommonPage = isCommonPage(matched, commonPageName);
    if (_isCommonPage && currentRoute.query.redirect) {
      matched = router.getMatched(currentRoute.query.redirect);
    }
  }
  return matched;
}
function useRouter(defaultRouter?: ReactViewRouter|null) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return defaultRouter || useContext(RouterContext);
}

type UseRouteWatchEvent = (...args: Parameters<onRouteChangeEvent>) => Promise<void|boolean>|void|boolean;

type UseRouteOptions = {
  watch?: boolean|UseRouteWatchEvent,
  delay?: boolean|number,
  ignoreSamePath?: boolean
}

function useRoute(
  defaultRouter?: ReactViewRouter|null,
  options: UseRouteOptions = {},
  anotherWatch: UseRouteWatchEvent|null = null
) {
  const router = useRouter(defaultRouter);
  const [route, setRoute] = useState(router ? (router.currentRoute || router.initialRoute) : null);
  if (options.watch && router) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onRouteChange: onRouteChangeEvent = useCallback(async (route, prevRoute, router) => {
      if (options.ignoreSamePath !== false && route && prevRoute && route.fullPath === prevRoute.fullPath) return;
      if (anotherWatch && await anotherWatch(route, prevRoute, router) === false) return;
      if (isFunction(options.watch) && await options.watch(route, prevRoute, router) === false) return;

      if (options.delay) setTimeout(() => setRoute(route), isNumber(options.delay) ? options.delay : 0);
      else setRoute(route);
    }, [options, anotherWatch]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRouteChanged(router, onRouteChange);
  }
  return route;
}

function useRouterView() {
  return useContext(RouterViewContext);
}

function useMatchedRouteIndex(matchedOffset: number = 0) {
  const view = useRouterView();
  const index = view ? view.state.depth : 0;
  return Math.max(0, index + matchedOffset);
}

type UseMatchedRouteOptions = {
  commonPageName?: string,
  matchedOffset?: number,
} & UseRouteOptions;

function useMatchedRouteAndIndex(
  defaultRouter?: ReactViewRouter|null,
  options: UseMatchedRouteOptions = {}
): [MatchedRoute|null, number] {
  const { matchedOffset } = options;
  const router = useRouter(defaultRouter);
  const routeIndex = useMatchedRouteIndex(matchedOffset);
  const matchRouteWatch = useCallback((route, prevRoute) => route.matched[routeIndex] !== prevRoute.matched[routeIndex], [routeIndex]);
  const route = useRoute(defaultRouter, options, matchRouteWatch);
  const matched = getRouteMatched(router, route, options.commonPageName);
  const matchedRoute = (matched && matched[routeIndex]) || null;
  return [matchedRoute, routeIndex];
}

function useMatchedRoute(defaultRouter?: ReactViewRouter|null, options?: UseMatchedRouteOptions) {
  const ret = useMatchedRouteAndIndex(defaultRouter, options);
  return  ret[0];
}

function useRouteMeta(
  metaKey: string|string[],
  defaultRouter?: ReactViewRouter|null,
  options?: {
    ignoreConfigRoute?: boolean,
  } & UseMatchedRouteOptions,
): [Partial<any> | null, (key: string, value: any) => void] {
  const router = useRouter(defaultRouter);
  const route = useMatchedRoute(router, options);
  const meta = (route && route.meta);
  const keyIsArray = Array.isArray(metaKey);
  if (keyIsArray && !metaKey.length) throw new Error('metaKey is Empty!');

  const [value, _setValue] = useState(() =>
    (
      keyIsArray
        ? (metaKey as string[]).reduce((p: Partial<any>, key) => {
          if (!meta) return p;
          p[key] = meta[key];
          return p;
        }, {})
        : { [metaKey as string]: meta && meta[metaKey as string] }
    ));

  const setValue = useCallback((newValue: any, setAll = false) => {
    if (!meta) return;
    if (!keyIsArray) {
      newValue = { [metaKey as string]: newValue };
    } else if (!setAll) {
      newValue = Object.keys(newValue).reduce((p: Partial<any>, key) => {
        if ((metaKey as string[]).includes(key)) p[key] = newValue[key];
        return p;
      }, {});
    }
    const changed = route && router && router.updateRouteMeta(route, newValue, { ignoreConfigRoute: options?.ignoreConfigRoute });
    if (!changed) return;
    _setValue({ ...value, ...newValue });
  }, [meta, keyIsArray, route, router, value, metaKey, options?.ignoreConfigRoute]);

  return keyIsArray
    ? [value, setValue]
    : [value[metaKey as string], setValue];
}


function useRouteState<T extends Record<string, any> = any>(
  defaultRouter?: ReactViewRouter|null,
  stateAction?: T | (() => T),
  options?: UseMatchedRouteOptions
): [routeState: T, setRouteState: (newState: T) => void] {
  const [defaultState] = useState(stateAction || {});
  const router = useRouter(defaultRouter);
  const route = useMatchedRoute(router || defaultRouter, options);
  const routeUrl = route && route.url;

  const setRouteState = useCallback(
    (newState: T) => router && router.replaceState(newState, route || undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, routeUrl],
  );

  let state = route && route.state;
  if (isEmptyRouteState(state) && defaultState) state = defaultState;

  return [state as T, setRouteState];
}

function useRouteParams<T extends Record<string, any> = any>(
  defaultRouter?: ReactViewRouter|null,
  options?: UseMatchedRouteOptions
): T {
  const router = useRouter(defaultRouter);
  const route = useMatchedRoute(router || defaultRouter, options);
  const params = route ? route.params as any : {}
  return params;
}

function useRouteQuery<T extends Record<string, any> = any>(
  defaultRouter?: ReactViewRouter|null,
  options?: UseRouteOptions
): T {
  const router = useRouter(defaultRouter);
  const route = useRoute(router || defaultRouter, options);
  return route ? route.query as any : {};
}

function useRouteChanged(router: ReactViewRouter, onChange: onRouteChangeEvent, deps: string[] = []) {
  const [plugin] = useState({} as ReactViewRoutePlugin);
  plugin.onRouteChange = onChange;

  return useEffect(() => {
    const unplugin = router.plugin(plugin);
    return () => unplugin && unplugin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, plugin, ...deps]);
}

function useRouteMetaChanged(router: ReactViewRouter, onChange: onRouteMetaChangeEvent, deps: string[] = []) {
  const [plugin] = useState({} as ReactViewRoutePlugin);
  plugin.onRouteMetaChange = useCallback((newVal, oldVal, route, router) => {
    if (deps.length && !deps.some(v => {
      if (isPlainObject(v)) return v === route.meta;
      return v in oldVal;
    })) return;
    return onChange(newVal, oldVal, route, router);
  }, [deps, onChange]);

  return useEffect(() => {
    const unplugin = router.plugin(plugin);
    return () => unplugin && unplugin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, plugin, ...deps]);
}

function createRouteGuardsRef(ref: Partial<any>) {
  if (ref && !ref.__routeGuardInfoHooks) innumerable(ref, '__routeGuardInfoHooks', true);
  return ref;
}

function useRouteGuardsRef<T extends RouteGuardsInfo>(
  ref: Ref<T>|undefined,
  guards: T|(() => T),
  deps: DependencyList = []
) {
  if (!isFunction(guards)) deps.concat(guards);
  return useImperativeHandle<Ref<RouteGuardsInfoHooks>, any>(
    ref as any,
    (...args) => {
      let ret: T;
      if (isFunction(guards)) ret = guards(...args);
      else ret = guards;
      return createRouteGuardsRef(ret);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
}

function useRouterViewEvent<T extends keyof RouterViewEvents>(
  name: T,
  onEvent: RouterViewEvents[T] extends Array<infer U> ? U : any,
  unshift?: boolean
) {
  const view = useRouterView();
  const [$refs] = useState({} as any);
  $refs.onEvent = onEvent;
  $refs.unshift = unshift;
  useEffect(() => {
    if (!view) return;
    const fn = (...args: any[]) => $refs.onEvent(...args);
    view._events[name][$refs.unshift ? 'unshift' : 'push'](fn);
    return () => {
      const idx = view._events[name].indexOf(fn);
      if (~idx) view._events[name].splice(idx, 1);
    };
  }, [$refs, view, name]);
}

function useViewActivate(onEvent: RouterViewEvents['activate'] extends Array<infer U> ? U : never) {
  const router = useRouter();
  const current = useMatchedRoute();
  useRouterViewEvent('activate', event => {
    if (!onEvent || !_checkActivate(router, current, event)) return;
    onEvent(event);
  });
}

function useViewDeactivate(onEvent: RouterViewEvents['deactivate'] extends Array<infer U> ? U : never) {
  const router = useRouter();
  const current = useMatchedRoute();
  useRouterViewEvent('deactivate', event => {
    if (!onEvent || !_checkDeactivate(router, current, event)) return;
    onEvent(event);
  }, true);
}

export {
  isCommonPage,
  getRouteMatched,

  useRouter,
  useRouteChanged,
  useRouteMetaChanged,
  useRoute,
  useRouteMeta,
  useRouteState,
  useRouteParams,
  useRouteQuery,
  useRouterView,
  useMatchedRouteIndex,
  useMatchedRoute,
  useMatchedRouteAndIndex,
  useRouteGuardsRef,
  useRouterViewEvent,
  useViewActivate,
  useViewDeactivate,

  createRouteGuardsRef
};
