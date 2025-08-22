import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactViewRouter from '../router';
import { ConfigRoute, MatchedRoute, RouteChildrenFn, RouteMeta } from '../types';
import {
  isCommonPage, getRouteMatched,
  useRouter, useMatchedRouteAndIndex, useRouteChanged, useRouteMetaChanged
} from './base';
import { isRouteChanged, hasOwnProp, getRouteChildren, readRouteMeta, isString } from '../util';

const DEFAULT_TITLE_NAME = 'title';

type filterCallback = (r: ConfigRoute, routes: ConfigRoute[], props: {
  router: ReactViewRouter
  level: number,
  maxLevel: number,
  refresh?: () => void,
  title?: string,
  visible?: boolean,
  meta: Partial<RouteMeta>
}) => boolean;

type RouteTitleInfo = {
  title: string,
  path: string,
  meta: Partial<any>,
  route: ConfigRoute,
  level: number,
  children?: RouteTitleInfo[]
}

function readRouteTitle(
  route: ConfigRoute,
  options: {
    titleName?: string,
    router?: ReactViewRouter,
    level?: number,
    maxLevel?: number,
    refresh?: () => void,
  } = {}
) {
  const ret = { visible: false, title: '' };
  const visible = readRouteMeta(route, 'visible', options) as boolean;
  if (visible === false) return ret;

  const titleName = options.titleName || DEFAULT_TITLE_NAME;
  ret.title = readRouteMeta(route, titleName, options) as string || '';
  ret.visible = Boolean(ret.title);

  return ret;
}

function readRouteTitles(
  router: ReactViewRouter,
  routes: ConfigRoute[]|RouteChildrenFn,
  options: {
    refresh?: () => void,
    filter?: filterCallback,
    titleName?: string,
    maxLevel?: number,
    level?: number,
  } = {}
) {
  const {
    refresh,
    filter,
    titleName = DEFAULT_TITLE_NAME,
    maxLevel = 99,
    level = 1,
  } = options;
  routes = getRouteChildren(routes);
  return routes
    .filter(r => r.meta[titleName])
    .map(r => {
      const { visible, title } = readRouteTitle(r, { router, titleName, level, maxLevel, refresh });
      if (visible === false) return;

      if (filter && filter(r, routes as ConfigRoute[], { title, visible, router, meta: r.meta, level, maxLevel, refresh }) === false) return;

      const ret: RouteTitleInfo = {
        title,
        path: r.path,
        meta: r.meta,
        route: r,
        level
      };
      if (level < maxLevel && Array.isArray(r.children) && r.children.length) {
        const children = readRouteTitles(router, r.children, { refresh, filter, titleName, maxLevel, level: level + 1 });
        if (children.length) ret.children = children as any;
      }
      return ret;
    }).filter(Boolean) as RouteTitleInfo[];
}

function getMatchedDepth(matchedRoute: MatchedRoute | null) {
  return matchedRoute ? matchedRoute.depth + 1 : 0;
}

function isTitleRoute(route?: ConfigRoute|MatchedRoute|null, titleName = DEFAULT_TITLE_NAME) {
  return route && hasOwnProp(route.meta, titleName);
}

function walkMatchedRouteList(
  callback: (matchedRoute: MatchedRoute, matchedRouteIndex: number) => void,
  matched: MatchedRoute[],
  depth: number,
  maxLevel: number,
  titleName: string = DEFAULT_TITLE_NAME
) {
  if (!callback) return;
  // let baseLevel = depth;
  while (depth < maxLevel && matched && matched[depth]) {
    const matchedRouteIndex = depth++;
    const matchedRoute = matched[matchedRouteIndex];
    if (isTitleRoute(matchedRoute, titleName)) {
      // const { visible } = readRouteTitle(matchedRoute.config, titleName, {
      //   maxLevel: maxLevel - baseLevel,
      //   level: depth - baseLevel
      // });
      // if (!visible) break;

      callback(matchedRoute, matchedRouteIndex);
    }
  }
}

function getMatchedRouteList(matched: MatchedRoute[], depth: number, maxLevel: number, titleName?: string) {
  const ret: MatchedRoute[] = [];
  walkMatchedRouteList(matchedRoute => {
    ret.push(matchedRoute);
  }, matched, depth, maxLevel, titleName);
  return ret;
}

function getMatchedRoutes(
  router: ReactViewRouter,
  matchedRoute: MatchedRoute|null,
  maxLevel: number,
  commonPageName?: string,
  titleName?: string
) {
  const currentRoute = router.currentRoute || router.initialRoute;
  const depth = getMatchedDepth(matchedRoute);
  const matchedRoutes = getMatchedRouteList(
    getRouteMatched(router, currentRoute, commonPageName),
    depth,
    maxLevel + depth,
    titleName
  );
  return matchedRoutes;
}

type OnNoMatchedPathCallback = (
  matchedPath: string,
  titles: RouteTitleInfo[],
  fallback: (fallbackPath: Parameters<ReactViewRouter['replace']>[0]) => void
) => void|Promise<void>;

type UseRouteTitleProps = {
  maxLevel?: number,
  filter?: filterCallback,
  filterMetas?: string[],
  manual?: boolean,
  matchedOffset?: number,
  commonPageName?: string,
  titleName?: string,
  onNoMatchedPath?: ':first'|string|OnNoMatchedPathCallback
}

function findTitleByMatchedPath(matchedPath: string, titles: RouteTitleInfo[], matchedTitles?: RouteTitleInfo[]) {
  if (!matchedPath) return undefined;
  let matchedTitle: RouteTitleInfo|undefined;
  titles.some(title => {
    if (title.path === matchedPath) {
      matchedTitle = title;
      if (matchedTitles) matchedTitles.push(title);
      return true;
    }
    if (title.children && title.children.length) {
      matchedTitle = findTitleByMatchedPath(matchedPath, title.children, matchedTitles);
      if (matchedTitle && matchedTitles) matchedTitles.unshift(title);
    }
    return matchedTitle;
  });
  return matchedTitle;
}

type RefreshTitlesFn = () => void;

function useRouteTitle(
  props?: UseRouteTitleProps,
  defaultRouter?: ReactViewRouter,
  deps: React.DependencyList[] = []
) {
  if (!props) props = {};
  const {
    maxLevel = 99, filterMetas = [], manual, matchedOffset = 0,
    titleName = DEFAULT_TITLE_NAME, commonPageName = 'commonPage'
  } = props;
  const [$refs] = useState({
    parsed: false,
    mounted: false,
    timerIds: {}
  } as {
    routeMetaChangedCallback?:() => void,
    filter?: UseRouteTitleProps['filter'],
    onNoMatchedPath?: UseRouteTitleProps['onNoMatchedPath'],
    parsed: boolean,
    mounted: boolean,
    timerIds: {
      onNoMatchedPath: number|NodeJS.Timeout,
      dirty: number|NodeJS.Timeout
    }
  });
  $refs.filter = props.filter;
  $refs.onNoMatchedPath = props.onNoMatchedPath;

  const router = useRouter(defaultRouter);
  if (!router) throw new Error('[useRouteTitle] router can not be null!');

  const [matchedRoute, routeIndex] = defaultRouter
    ? [null, 0]
  // eslint-disable-next-line react-hooks/rules-of-hooks
    : useMatchedRouteAndIndex(undefined, { matchedOffset, commonPageName });

  const [dirty, setDirty] = useState(false);
  const refreshTitles: RefreshTitlesFn = useCallback(() => setDirty(true), [setDirty]);
  const refreshTabs = useCallback(
    (routes = []) => {
      $refs.parsed = true;
      return readRouteTitles(router, routes, { refresh: refreshTitles, filter: $refs.filter, titleName, maxLevel });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, $refs, maxLevel, refreshTitles, ...deps]
  );

  const [titles, setTitles] = useState(() => (
    manual ? [] : refreshTabs(defaultRouter ? router.routes : (matchedRoute ? matchedRoute.config.children : []))
  ));

  const [matchedRoutes, setMatchedRoutes] = useState(
    () => getMatchedRoutes(router, matchedRoute, maxLevel, commonPageName, titleName)
  );

  const matchedTitles = useMemo(() => {
    const ret: RouteTitleInfo[] = [];
    if (!matchedRoutes.length || !$refs.parsed) return ret;
    const currentRoute = matchedRoutes[matchedRoutes.length - 1];
    findTitleByMatchedPath(currentRoute.path, titles, ret);
    return ret;
  }, [$refs.parsed, matchedRoutes, titles]);

  const currentPaths = useMemo(() => {
    if (!matchedRoutes.length || !$refs.parsed) return [] as string[];
    const currentRoute = matchedRoutes[matchedRoutes.length - 1];
    const currentTitle = findTitleByMatchedPath(currentRoute.path, titles);
    if (!currentTitle && $refs.mounted && $refs.onNoMatchedPath) {
      if ($refs.timerIds.onNoMatchedPath) clearTimeout($refs.timerIds.onNoMatchedPath);
      $refs.timerIds.onNoMatchedPath = setTimeout(() => {
        $refs.timerIds.onNoMatchedPath = 0;
        if (!$refs.mounted || !$refs.onNoMatchedPath) return;
        const fallback: Parameters<OnNoMatchedPathCallback>[2] = fallbackPath => {
          const toPath = isString(fallbackPath) ? fallbackPath : fallbackPath.path;
          const currentRoute = router.pendingRoute || router.currentRoute || router.initialRoute;
          if (!toPath || (currentRoute && currentRoute.path === toPath)) return;
          return router.replace(fallbackPath);
        };
        if (isString($refs.onNoMatchedPath)) {
          if (!titles.length) return;
          return fallback($refs.onNoMatchedPath === ':first' ? titles[0].path : $refs.onNoMatchedPath);
        }
        $refs.onNoMatchedPath(currentRoute.path, titles, fallback);
      }, 0);
    }
    return currentTitle ? matchedRoutes.map(r => r.path) : [];
  }, [matchedRoutes, titles, $refs, router]);

  useRouteChanged(router, useCallback((currentRoute, prevRoute) => {
    if (!$refs.mounted) return;
    const routes = getMatchedRoutes(router, matchedRoute, maxLevel, commonPageName, titleName);
    if (routes.length !== matchedRoutes.length || matchedRoutes.some((route, i) => route.path !== routes[i].path)) {
      setMatchedRoutes(routes);
    }

    if (!defaultRouter) {
      const matched = getRouteMatched(router, currentRoute, commonPageName);
      if (matched) {
        const depth = getMatchedDepth(matchedRoute);
        const prevMatched = getRouteMatched(router, prevRoute, commonPageName);
        const matchedRouteList = getMatchedRouteList(prevMatched, depth, maxLevel, titleName);
        const newMatchedRouteList = getMatchedRouteList(matched, depth, maxLevel, titleName);
        if (matchedRouteList.length !== newMatchedRouteList.length
          || newMatchedRouteList.some((newMatchedRoute, i) => isRouteChanged(matchedRouteList[i], newMatchedRoute))) {
          const newMatchedRoute = newMatchedRouteList[0];
          setTitles(
            refreshTabs(newMatchedRoute
              ? newMatchedRoute.config.parent ? newMatchedRoute.config.parent.children : router.routes
              : [])
          );
        }
      }
    }
  }, [router, matchedRoute, maxLevel, commonPageName, titleName, matchedRoutes, defaultRouter, refreshTabs, $refs]));

  $refs.routeMetaChangedCallback = useCallback(
    () => {
      if (!$refs.mounted) return;
      const matched = getRouteMatched(router, router.currentRoute, commonPageName);
      const matchedRoute = matched[routeIndex];
      setTitles(refreshTabs(defaultRouter ? router.routes : (matchedRoute ? matchedRoute.config.children : [])));
    },
    [router, commonPageName, routeIndex, refreshTabs, defaultRouter, $refs]
  );
  useRouteMetaChanged(router, $refs.routeMetaChangedCallback, [...filterMetas, titleName, 'visible']);

  useMemo(() => {
    if (!dirty || !$refs.mounted) return;
    setDirty(false);
    if ($refs.timerIds.dirty) return;
    $refs.timerIds.dirty = setTimeout(() => {
      $refs.timerIds.dirty = 0;
      router.isRunning && $refs.routeMetaChangedCallback && $refs.routeMetaChangedCallback();
    }, 0);
  }, [router, dirty, $refs]);

  useEffect(() => {
    $refs.mounted = true;
    return () => {
      $refs.mounted = false;
    };
  }, [$refs]);


  return {
    parsed: $refs.parsed,

    titles,
    setTitles,

    refreshTitles,

    matchedRoutes,
    matchedTitles,

    currentPaths,
  };
}

export {
  isTitleRoute,
  isCommonPage,
  readRouteTitle,
  readRouteTitles,

  filterCallback,
  RouteTitleInfo,
};

export default useRouteTitle;
