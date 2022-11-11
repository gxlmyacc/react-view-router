import { Ref, DependencyList } from 'react';
import ReactViewRouter from '../router';
import { RouteGuardsInfo, Route, onRouteChangeEvent, onRouteMetaChangeEvent, MatchedRoute } from '../types';
declare function isCommonPage(matched: MatchedRoute[], commonPageName?: string): boolean;
declare function getRouteMatched(router: ReactViewRouter | null, currentRoute: Route | null, commonPageName?: string): never[] | import("../types").MatchedRouteArray;
declare function useRouter(defaultRouter?: ReactViewRouter | null): any;
declare type UseRouteWatchEvent = (...args: Parameters<onRouteChangeEvent>) => Promise<void | boolean> | void | boolean;
declare type UseRouteOptions = {
    watch?: boolean | UseRouteWatchEvent;
    delay?: boolean | number;
    ignoreSamePath?: boolean;
};
declare function useRoute(defaultRouter?: ReactViewRouter | null, options?: UseRouteOptions, anotherWatch?: UseRouteWatchEvent | null): any;
declare function useRouterView(): any;
declare function useMatchedRouteIndex(matchedOffset?: number): number;
declare type UseMatchedRouteOptions = {
    commonPageName?: string;
    matchedOffset?: number;
} & UseRouteOptions;
declare function useMatchedRouteAndIndex(defaultRouter?: ReactViewRouter | null, options?: UseMatchedRouteOptions): [MatchedRoute | null, number];
declare function useMatchedRoute(defaultRouter?: ReactViewRouter | null, options?: UseMatchedRouteOptions): MatchedRoute | null;
declare function useRouteMeta(metaKey: string | string[], defaultRouter?: ReactViewRouter | null, options?: {
    ignoreConfigRoute?: boolean;
} & UseMatchedRouteOptions): [Partial<any> | null, (key: string, value: any) => void];
declare function useRouteState<T extends Record<string, any> = any>(defaultRouter?: ReactViewRouter | null, stateAction?: T | (() => T), options?: UseMatchedRouteOptions): [routeState: T, setRouteState: (newState: T) => void];
declare function useRouteChanged(router: ReactViewRouter, onChange: onRouteChangeEvent, deps?: string[]): void;
declare function useRouteMetaChanged(router: ReactViewRouter, onChange: onRouteMetaChangeEvent, deps?: string[]): void;
declare function createRouteGuardsRef(ref: Partial<any>): Partial<any>;
declare function useRouteGuardsRef<T extends RouteGuardsInfo>(ref: Ref<T> | undefined, guards: T | (() => T), deps?: DependencyList): void;
export { isCommonPage, getRouteMatched, useRouter, useRouteChanged, useRouteMetaChanged, useRoute, useRouteMeta, useRouteState, useRouterView, useMatchedRouteIndex, useMatchedRoute, useMatchedRouteAndIndex, useRouteGuardsRef, createRouteGuardsRef };
