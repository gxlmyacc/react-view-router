import { useEffect } from 'react';
import {
  ConfigRouteArray,
  ReactViewRouterMode, RouteResolveNameFn
} from '../types';
import ReactViewRouter from '../router';
import { HashType } from '../history';

function useManualRouter(router: ReactViewRouter, {
  basename = '',
  routerMode = 'hash',
  routerHashType,
  hashType,
  resolveRouteName,
  routes
}: {
  basename?: string,
  routerMode?: ReactViewRouterMode,
  routerHashType?: HashType,
  hashType?: HashType,
  resolveRouteName?: RouteResolveNameFn,
  routes?: ConfigRouteArray
} = {}) {
  if (!router.isRunning) {
    if (routes) router.use({ routes });
    router.start({
      basename,
      mode: routerMode,
      hashType: routerHashType || hashType
    });
    resolveRouteName && router.resolveRouteName(resolveRouteName);
  }

  useEffect(() => () => {
    if (router.isRunning) router.stop();
  }, [router]);

  return [router];
}

export default useManualRouter;
