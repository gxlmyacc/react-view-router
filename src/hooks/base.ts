import { useContext, useState, useEffect, useCallback, useImperativeHandle, Ref, DependencyList } from 'react';
import ReactViewRouter from '../router';
import { RouterContext, RouterViewContext } from '../context';
import {
  RouteGuardsInfo,
  RouteGuardsInfoHooks, onRouteChangeEvent, onRouteMetaChangeEvent
} from '../types';
import { innumerable, isFunction, isPlainObject } from '../util';

function useRouter(defaultRouter?: ReactViewRouter|null) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return defaultRouter || useContext(RouterContext);
}

function useRoute(defaultRouter?: ReactViewRouter|null) {
  const router = useRouter(defaultRouter);
  return router ? (router.currentRoute || router.initialRoute) : null;
}

function useRouteMeta(
  metaKey: string|string[],
  defaultRouter?: ReactViewRouter|null
): [Partial<any> | null, (key: string, value: any) => void] {
  const router = useRouter(defaultRouter);
  const route = useMatchedRoute(router);
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
    let changed = route && router && router.updateRouteMeta(route.config, newValue);
    if (!changed) return;
    _setValue({ ...value, ...newValue });
  }, [meta, keyIsArray, route, router, value, metaKey]);

  return keyIsArray
    ? [value, setValue]
    : [value[metaKey as string], setValue];
}

function useRouterView() {
  return useContext(RouterViewContext);
}

function useMatchedRouteIndex(matchedOffset: number = 0) {
  const view = useRouterView();
  const index = view ? view.state._routerDepth : 0;
  return Math.max(0, index + matchedOffset);
}

function useMatchedRoute(defaultRouter?: ReactViewRouter|null, matchedOffset: number = 0) {
  const route = useRoute(defaultRouter);
  const routeIndex = useMatchedRouteIndex(matchedOffset);
  return (route && route.matched[routeIndex]) || null;
}


function useRouteState<T = any>(
  defaultRouter?: ReactViewRouter|null
): [T, (newState: T) => void] {
  const router = useRouter(defaultRouter);
  const route = useMatchedRoute(router || defaultRouter);
  const routeUrl = route && route.url;

  const setRouteState = useCallback(
    (newState: T) => router && router.replaceState(newState, route || undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, routeUrl],
  );

  return [(route ? route.state : {}) as T, setRouteState];
}

function useRouteChanged(router: ReactViewRouter, onChange: onRouteChangeEvent) {
  return useEffect(() => {
    const unplugin = onChange && router.plugin(onChange);
    return () => unplugin && unplugin();
  }, [router, onChange]);
}

function useRouteMetaChanged(router: ReactViewRouter, onChange: onRouteMetaChangeEvent, deps: string[] = []) {
  return useEffect(() => {
    const unplugin = onChange && router.plugin({
      onRouteMetaChange(newVal, oldVal, route, router) {
        if (deps.length && !deps.some(v => {
          if (isPlainObject(v)) return v === route.meta;
          return v in oldVal;
        })) return;
        return onChange(newVal, oldVal, route, router);
      }
    });
    return () => unplugin && unplugin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, onChange, ...deps]);
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

export {
  useRouter,
  useRouteChanged,
  useRouteMetaChanged,
  useRoute,
  useRouteMeta,
  useRouteState,
  useRouterView,
  useMatchedRouteIndex,
  useMatchedRoute,
  useRouteGuardsRef,

  createRouteGuardsRef
};
