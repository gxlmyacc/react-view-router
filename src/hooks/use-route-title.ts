import { useState, useCallback, useMemo, useRef } from 'react';
import RainbowRouter from '../router';
import { ConfigRoute, ConfigRouteArray, MatchedRoute, Route } from '../types';
import { useRouter, useMatchedRoute, useRouteChanged, useRouteMetaChanged } from './base';
import { isFunction, isRouteChanged } from '../util';

type filterCallback = (r: ConfigRoute, routes: ConfigRouteArray, props: {
  router: RainbowRouter
  level: number,
  maxLevel: number,
  refresh: () => void,
  title?: string,
  visible?: boolean
}) => boolean;

type RouteTitleInfo = {
  title: string,
  path: string,
  meta: Partial<any>,
  children?: RouteTitleInfo[]
}

function readRouteMeta(route: ConfigRoute, key: string = '', props: {
  router?: RainbowRouter|null,
  [key: string]: any
} = {}) {
  let value = key && route.meta[key];
  if (isFunction(value)) {
    value = value(route, route.parent ? route.parent.children : (props.router && props.router.routes), props);
  }
  return value;
}

function walkRouteTitle(
  router: RainbowRouter,
  routes: ConfigRouteArray = [],
  refresh: () => void,
  filter?: filterCallback,
  maxLevel = 99,
  level = 1,
) {
  return routes
    .filter(r => r.meta.title)
    .map(r => {
      const visible = readRouteMeta(r, 'visible', { router, level, maxLevel, refresh });
      if (visible === false) return;

      const title = readRouteMeta(r, 'title', { router, level, maxLevel, refresh });
      if (!title) return;

      if (filter && filter(r, routes, { title, visible, router, level, maxLevel, refresh }) === false) return;

      const ret: RouteTitleInfo = {
        title,
        path: r.path,
        meta: r.meta,
      };
      if (level < maxLevel && Array.isArray(r.children) && r.children.length) {
        const children = walkRouteTitle(router, r.children, refresh, filter, maxLevel, level + 1);
        if (children.length) ret.children = children as any;
      }
      return ret;
    }).filter(Boolean);
}

function getMatched(router: RainbowRouter, currentRoute: Route) {
  let { matched } = currentRoute;
  if (matched) {
    const isCommonPage = matched.some(r => r.meta.commonPage);
    if (isCommonPage && currentRoute.query.redirect) {
      matched = router.getMatched(currentRoute.query.redirect);
    }
  }
  return matched;
}

function getMatchedDepth(matchedRoute: MatchedRoute | null) {
  return matchedRoute ? matchedRoute.depth + 1 : 0;
}

function getMatchedPathList(matched: MatchedRoute[], depth: number, maxLevel: number) {
  const ret = [];
  while (depth < maxLevel && matched[depth]) {
    const { path } = matched[depth++];
    ret.push(path);
  }
  return ret;
}

let dirtyTimerId: NodeJS.Timeout|null;

function useRouteTitle(
  props: {
    maxLevel?: number,
    filter?: filterCallback,
    filterMetas?: string[],
    manual?: boolean,
    matchedOffset?: number,
  } = {},
  defaultRouter?: RainbowRouter,
  deps: any[] = []
) {
  const { maxLevel = 99, filter, filterMetas = [], manual, matchedOffset = 0 } = props;
  const ref = useRef<{ routeMetaChangedCallback?:() => void }>({});

  const router: RainbowRouter = useRouter(defaultRouter) as any;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const matchedRoute = defaultRouter ? null : useMatchedRoute(undefined, matchedOffset);

  const [dirty, setDirty] = useState(false);
  const refreshTitles = useCallback(() => setDirty(true), [setDirty]);
  const refreshTabs = useCallback(
    (routes = []) => walkRouteTitle(router, routes, refreshTitles, filter, maxLevel),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, filter, maxLevel, refreshTitles, ...deps]
  );

  const [titles, setTitles] = useState(() => (
    manual ? [] : refreshTabs(defaultRouter ? router.routes : (matchedRoute ? matchedRoute.config.children : []))
  ));

  const [currentPaths, setCurrentPaths] = useState(() => {
    const currentRoute = router.currentRoute || router.initialRoute;
    const depth = getMatchedDepth(matchedRoute);
    return getMatchedPathList(
      getMatched(router, currentRoute),
      depth,
      maxLevel + depth,
    );
  });

  useRouteChanged(router, useCallback((route: Route) => {
    const depth = getMatchedDepth(matchedRoute);
    const paths = getMatchedPathList(
      getMatched(router, route),
      depth,
      maxLevel + depth,
    );
    if (paths.length !== currentPaths.length || currentPaths.some((path, i) => path !== paths[i])) {
      setCurrentPaths(paths);
    }
    if (!defaultRouter) {
      const matched = getMatched(router, route);
      const newMatchedRoute = matched[matchedRoute ? matchedRoute.depth : 0];
      if (isRouteChanged(matchedRoute, newMatchedRoute)) {
        setTitles(refreshTabs(newMatchedRoute ? newMatchedRoute.config.children : []));
      }
    }
  }, [matchedRoute, router, maxLevel, currentPaths, defaultRouter, refreshTabs]));

  ref.current.routeMetaChangedCallback = useCallback(
    () => setTitles(refreshTabs(defaultRouter ? router.routes : (matchedRoute ? matchedRoute.config.children : []))),
    [refreshTabs, defaultRouter, matchedRoute, router.routes]
  );
  useRouteMetaChanged(router, ref.current.routeMetaChangedCallback, [...filterMetas, 'title', 'visible']);

  useMemo(() => {
    if (!dirty) return;
    setDirty(false);
    if (dirtyTimerId) return;
    dirtyTimerId = setTimeout(() => {
      dirtyTimerId = null;
      router.isRunning && ref.current.routeMetaChangedCallback && ref.current.routeMetaChangedCallback();
    }, 0);
  }, [router, dirty, ref]);

  return {
    titles,
    setTitles,

    refreshTitles,

    currentPaths,
    setCurrentPaths,
  };
}

export {
  readRouteMeta,
  walkRouteTitle,
};

export default useRouteTitle;
