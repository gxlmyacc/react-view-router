import { Ref, DependencyList } from 'react';
import ReactViewRouter from '.';
import { HashType } from './history';
import { ReactViewRouterMode, RouteResolveNameFn, RouteGuardsInfo, onRouteChangeEvent, onRouteMetaChangeEvent } from './types';
declare function useRouter(defaultRouter?: ReactViewRouter | null): ReactViewRouter | null;
declare function useRoute(defaultRouter?: ReactViewRouter | null): import("./types").Route | null;
declare function useRouteMeta(metaKey: string | string[], defaultRouter?: ReactViewRouter | null): [Partial<any> | null, (key: string, value: any) => void];
declare function useRouterView(): import("./router-view").RouterViewComponent<import("./router-view").RouterViewProps, import("./router-view").RouterViewState, any> | null;
declare function useMatchedRouteIndex(): number;
declare function useMatchedRoute(defaultRouter?: ReactViewRouter | null): import("./types").MatchedRoute | null;
declare function useManualRouter(router: ReactViewRouter, { basename, routerMode, routerHashType, resolveRouteName, }?: {
    basename?: string;
    routerMode?: ReactViewRouterMode;
    routerHashType?: HashType;
    resolveRouteName?: RouteResolveNameFn;
}): ReactViewRouter[];
declare function useRouteChanged(router: ReactViewRouter, onChange: onRouteChangeEvent): void;
declare function useRouteMetaChanged(router: ReactViewRouter, onChange: onRouteMetaChangeEvent, deps?: string[]): void;
declare function createRouteGuardsRef(ref: Partial<any>): Partial<any>;
declare function useRouteGuardsRef<T extends RouteGuardsInfo>(ref: Ref<T> | undefined, guards: T | (() => T), deps?: DependencyList): void;
export { useManualRouter, useRouter, useRouteChanged, useRouteMetaChanged, useRoute, useRouteMeta, useRouterView, useMatchedRouteIndex, useMatchedRoute, useRouteGuardsRef, createRouteGuardsRef };