import { HistoryStackInfo, RouteHistoryLocation, MatchedRouteArray } from './types';
import { isReadonly } from './util';

type RouterBasenameContext = {
  basenameNoSlash: string;
  history: { stacks: HistoryStackInfo[] };
  stacks: HistoryStackInfo[];
};

type RouterParentResolveContext = {
  parent: {
    basename: string;
    getMatched(pathname: string): MatchedRouteArray;
    parent: RouterParentResolveContext['parent'] | null;
  } | null;
};

type RouterBrowserQueryContext = {
  isMemoryMode: boolean;
  isHashMode: boolean;
  isBrowserMode: boolean;
  parseQuery(search: string, queryProps?: any): Record<string, any>;
  queryProps?: any;
};

type RouterNestedInitContext = {
  parent: {
    basename: string;
    currentRoute: { url: string; query: Record<string, any>; search: string } | null;
  } | null;
};

/**
 * 在 rememberInitialRoute 场景下，从 history 栈中选取 basename 对应的初始栈项。
 * @param stacks history 栈列表（含当前 location）
 * @param basenameNoSlash 无尾斜杠的 basename
 * @returns 匹配的栈项，无则 undefined
 */
export function pickRememberInitialBasenameStack(
  stacks: HistoryStackInfo[],
  basenameNoSlash: string,
): HistoryStackInfo | undefined {
  for (let i = 0; i < stacks.length; i++) {
    const currentStack = stacks[i];
    if (!currentStack.pathname.startsWith(basenameNoSlash)) break;
    if (i === stacks.length - 1 || !stacks[i + 1].pathname.startsWith(basenameNoSlash)) {
      return currentStack;
    }
  }
  return undefined;
}

/**
 * 将浏览器地址栏 query 合并到初始路由 location（hash/browser 模式）。
 * @param router 路由器实例
 * @param historyLocation 待合并的 history location
 */
export function mergeInitialRouteBrowserQuery(
  router: RouterBrowserQueryContext,
  historyLocation: RouteHistoryLocation,
): void {
  if (router.isMemoryMode || !globalThis?.location?.search) return;
  const query = router.parseQuery(globalThis.location.search, router.queryProps);
  if (router.isHashMode) {
    Object.assign(historyLocation.query, query);
  } else if (router.isBrowserMode) {
    Object.keys(historyLocation.query).forEach((key) => {
      if (query[key] !== undefined) {
        historyLocation.query[key] = query[key];
      }
    });
  }
}

/**
 * 从 history 栈同步 basename 子路径到 router.stacks。
 * @param router 路由器实例
 */
export function syncBasenameRouterStacks(router: RouterBasenameContext): void {
  const basename = router.basenameNoSlash;
  const stacks: HistoryStackInfo[] = [];
  let prevStack: HistoryStackInfo | null = null;
  for (let i = router.history.stacks.length - 1; i >= 0; i--) {
    const info = router.history.stacks[i];
    if (!info.pathname.startsWith(basename) || (prevStack && prevStack.index <= info.index)) break;
    let pathname = info.pathname.substr(basename.length, info.pathname.length);
    if (!pathname) pathname = '/';
    prevStack = { ...info, pathname };
    stacks.unshift(prevStack);
  }
  if (!router.stacks.length && stacks.length) {
    router.stacks.splice(0, router.stacks.length, ...stacks);
  } else {
    let idx = router.stacks.findIndex((currentStack, i) => {
      const newStack = stacks[i];
      if (newStack && currentStack.timestamp === newStack.timestamp) return;
      return true;
    });
    if (idx < 0) idx = 0;
    router.stacks.splice(idx, router.stacks.length - idx, ...stacks.slice(idx, stacks.length));
  }
}

/**
 * 短 pathname 沿父级 router 解析为完整路径。
 * @param router 当前路由器
 * @param pathname 待解析路径
 * @returns 解析后的 pathname
 */
export function resolveShortPathnameViaParent(
  router: RouterParentResolveContext,
  pathname: string,
): string {
  let parent = router.parent;
  while (parent) {
    if (pathname.length >= parent.basename.length) {
      const parentMatched = parent.getMatched(pathname);
      if (parentMatched.length) {
        return parentMatched[parentMatched.length - 1].path + parentMatched.unmatchedPath;
      }
    }
    parent = parent.parent;
  }
  return pathname;
}

/**
 * 嵌套子 router 初始化时从父级同步 URL 到 location。
 * @param router 子路由器
 * @param location 待修正的 location
 * @param pathname 当前 pathname
 */
export function applyNestedChildInitLocation(
  router: RouterNestedInitContext,
  location: RouteHistoryLocation | Record<string, any>,
  pathname: string,
): void {
  if (!router.parent?.currentRoute) return;
  let url = router.parent.currentRoute.url;
  if (url && router.parent.basename) {
    url = router.parent.basename.substr(0, router.parent.basename.length - 1) + url;
  }
  if (!pathname.startsWith(url)) {
    if ((location as RouteHistoryLocation).pathname != null) {
      (location as RouteHistoryLocation).pathname = url;
    }
    if (location.path != null) location.path = url;
    if (location.query) location.query = router.parent.currentRoute.query;
    if (!isReadonly(location, 'search')) {
      location.search = router.parent.currentRoute.search;
    }
  }
}
