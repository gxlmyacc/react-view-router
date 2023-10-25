import { NormalizedConfigRouteArray, HistoryFix, RouteResolveNameFn, UserConfigRoute, ConfigRoute, History4 } from '../types';
import ReactViewRouter from '../router';
import { HashType, HistoryType } from '../history';
type ManualRouterOptions = {
    basename?: string;
    pathname?: string;
    history?: HistoryFix | History4;
    mode?: HistoryType | HistoryFix;
    routerMode?: HistoryType | HistoryFix;
    hashType?: HashType;
    resolveRouteName?: RouteResolveNameFn;
    routes?: NormalizedConfigRouteArray | UserConfigRoute[] | ConfigRoute[];
    manual?: boolean;
};
declare function useManualRouter(router: ReactViewRouter, options?: ManualRouterOptions): {
    router: ReactViewRouter;
    start: (overrideOptions?: Omit<ManualRouterOptions, 'manual'>) => void;
};
export { ManualRouterOptions };
export default useManualRouter;
