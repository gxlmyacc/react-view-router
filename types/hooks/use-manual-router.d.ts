import { ConfigRouteArray, ReactViewRouterMode, RouteResolveNameFn } from '../types';
import ReactViewRouter from '../router';
import { HashType } from '../history';
declare function useManualRouter(router: ReactViewRouter, { basename, routerMode, routerHashType, hashType, resolveRouteName, routes }?: {
    basename?: string;
    routerMode?: ReactViewRouterMode;
    routerHashType?: HashType;
    hashType?: HashType;
    resolveRouteName?: RouteResolveNameFn;
    routes?: ConfigRouteArray;
}): ReactViewRouter[];
export default useManualRouter;
