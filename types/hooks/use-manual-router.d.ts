import { ConfigRouteArray, HistoryFix, RouteResolveNameFn } from '../types';
import ReactViewRouter from '../router';
import { HashType, HistoryType } from '../history';
declare type ManualRouterOptions = {
    basename?: string;
    pathname?: string;
    history?: HistoryFix;
    mode?: HistoryType | HistoryFix;
    routerMode?: HistoryType | HistoryFix;
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
