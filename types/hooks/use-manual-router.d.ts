import { ConfigRouteArray, ReactViewRouterMode, RouteResolveNameFn } from '../types';
import ReactViewRouter from '../router';
import { HashType } from '../history';
declare type ManualRouterOptions = {
    basename?: string;
    routerMode?: ReactViewRouterMode;
    routerHashType?: HashType;
    hashType?: HashType;
    resolveRouteName?: RouteResolveNameFn;
    routes?: ConfigRouteArray;
    manual?: boolean;
};
declare function useManualRouter(router: ReactViewRouter, options?: ManualRouterOptions): {
    router: ReactViewRouter;
    start: (overrideOptions?: Omit<ManualRouterOptions, 'manual'>) => void;
};
export { ManualRouterOptions };
export default useManualRouter;
