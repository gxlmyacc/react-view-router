import { useState, useEffect, useCallback } from 'react';
import {
  ConfigRouteArray,
  HistoryFix,
  RouteResolveNameFn
} from '../types';
import ReactViewRouter from '../router';
import { HashType, HistoryType } from '../history';
// import { RouterContext } from '../context';

type ManualRouterOptions = {
  basename?: string,
  pathname?: string,
  history?: HistoryFix,
  mode?: HistoryType|HistoryFix,
  routerMode?: HistoryType|HistoryFix,
  hashType?: HashType,
  resolveRouteName?: RouteResolveNameFn,
  routes?: ConfigRouteArray,
  manual?: boolean,
};

function getModeFromOptions(options: ManualRouterOptions) {
  return options.routerMode || options.mode;
}

function useManualRouter(router: ReactViewRouter, options: ManualRouterOptions = {}) {
  const [$refs] = useState({
    isRunning: false,
    router,
    options
  });
  $refs.router = router;
  $refs.options = options;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const parentRouter = getModeFromOptions(options) === HistoryType.memory ? useContext<ReactViewRouter>(RouterContext) : null;

  const start = useCallback((overrideOptions: Omit<ManualRouterOptions, 'manual'> = {}) => {
    const { router, options } = $refs;
    if (!$refs.isRunning || !router.isRunning) {
      $refs.isRunning = true;
      const routes = overrideOptions.routes || options.routes;
      if (routes) router.use({ routes });

      const mode = getModeFromOptions(overrideOptions) || getModeFromOptions(options) || HistoryType.hash;
      const hashType =  overrideOptions.hashType || options.hashType;
      const history = (overrideOptions.history || options.history);
      // || (mode === HistoryType.memory && parentRouter && parentRouter.mode === HistoryType.memory ? parentRouter.history : undefined);
      router.start({
        basename: overrideOptions.basename || options.basename || '',
        pathname: overrideOptions.pathname || options.pathname || '',
        mode,
        hashType,
        history
      });

      const resolveRouteName = overrideOptions.resolveRouteName || options.resolveRouteName;
      resolveRouteName && router.resolveRouteName(resolveRouteName);
    }
  }, [$refs]);
  if (!options.manual) start();

  useEffect(() => () => {
    if (router.isRunning) router.stop();
    $refs.isRunning = false;
  }, [$refs, router]);

  return {
    router,
    start
  };
}

export {
  ManualRouterOptions
};

export default useManualRouter;
