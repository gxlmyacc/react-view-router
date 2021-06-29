import { Ref, DependencyList } from 'react';
import ReactViewRouter from '../router';
import { RouteGuardsInfo, onRouteChangeEvent, onRouteMetaChangeEvent } from '../types';
declare function useRouter(defaultRouter?: ReactViewRouter | null): ReactViewRouter | null;
declare function useRoute(defaultRouter?: ReactViewRouter | null): import("../types").Route | null;
declare function useRouteMeta(metaKey: string | string[], defaultRouter?: ReactViewRouter | null): [Partial<any> | null, (key: string, value: any) => void];
declare function useRouterView(): import("../router-view").RouterViewComponent<import("..").RouterViewProps, import("..").RouterViewState, any> | null;
declare function useMatchedRouteIndex(): number;
declare function useMatchedRoute(defaultRouter?: ReactViewRouter | null): import("../types").MatchedRoute | null;
declare function useRouteState<T = any>(defaultRouter?: ReactViewRouter | null): [T, (newState: T) => void];
declare function useRouteChanged(router: ReactViewRouter, onChange: onRouteChangeEvent): void;
declare function useRouteMetaChanged(router: ReactViewRouter, onChange: onRouteMetaChangeEvent, deps?: string[]): void;
declare function createRouteGuardsRef(ref: Partial<any>): Partial<any>;
declare function useRouteGuardsRef<T extends RouteGuardsInfo>(ref: Ref<T> | undefined, guards: T | (() => T), deps?: DependencyList): void;
export { useRouter, useRouteChanged, useRouteMetaChanged, useRoute, useRouteMeta, useRouteState, useRouterView, useMatchedRouteIndex, useMatchedRoute, useRouteGuardsRef, createRouteGuardsRef };
