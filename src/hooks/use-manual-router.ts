import { useState, useEffect } from 'react';
import {
  ConfigRouteArray,
  ReactViewRouterMode, RouteResolveNameFn
} from '../types';
import ReactViewRouter from '../router';
import { HashType } from '../history';

type ManualRouterOptions = {
  basename?: string,
  routerMode?: ReactViewRouterMode,
  routerHashType?: HashType,
  hashType?: HashType,
  resolveRouteName?: RouteResolveNameFn,
  routes?: ConfigRouteArray,
  manual?: boolean
};

function useManualRouter(router: ReactViewRouter, options: ManualRouterOptions = {}) {
  const [$refs] = useState({ isRunning: false });
  const { manual = false } = options;

  const start = (overrideOptions: Omit<ManualRouterOptions, 'manual'> = {}) => {
    if (!$refs.isRunning || !router.isRunning) {
      $refs.isRunning = true;

      const routes = overrideOptions.routes || options.routes;
      if (routes) router.use({ routes });

      router.start({
        basename: overrideOptions.basename || options.basename || '',
        mode: overrideOptions.routerMode || options.routerMode || 'hash',
        hashType: overrideOptions.routerHashType || overrideOptions.hashType
          || options.routerHashType || options.hashType
      });

      const resolveRouteName = overrideOptions.resolveRouteName || options.resolveRouteName;
      resolveRouteName && router.resolveRouteName(resolveRouteName);
    }
  };
  if (!manual) start();

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
