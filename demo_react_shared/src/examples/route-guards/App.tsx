import React, { useEffect } from 'react';
import {
  RouterLink,
  RouterView,
  useManualRouter,
} from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import GuardLog from './components/GuardLog';
import router from './history';
import routes from './routes';
import { afterEach, beforeEach, beforeResolve } from './global-guards';
import { useDemoRuntime } from '../../workspace/context';
import './App.scss?scoped';

router.beforeEach(beforeEach);
router.beforeResolve(beforeResolve);
router.afterEach(afterEach);

export interface RouteGuardsAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function RouteGuardsApp({
  basename,
  mode,
}: RouteGuardsAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start } = useManualRouter(router, {
    basename,
    mode,
    routes,
    manual: true,
  });
  useEffect(() => {
    start();
  }, [start]);
  return (
    <div className="guard-example">
      <div className="example-heading">
        <div>
          <h2>{t('routeGuards')}</h2>
          <p>{t('routeGuardsDescription')}</p>
          <div className="router-ownership">
            <span>{t('frontendRouter')}</span>
            <span aria-hidden="true">→</span>
            <span>{t('moduleRouter')}</span>
          </div>
        </div>
        <nav className="route-navigation">
          <RouterLink router={router} to="/home/main/some">{t('someLink')}</RouterLink>
          <RouterLink router={router} to="/home/main/other">{t('otherLink')}</RouterLink>
          <RouterLink router={router} to="/login">{t('loginLink')}</RouterLink>
        </nav>
      </div>
      <div className="guard-demo-grid">
        <div className="route-preview"><RouterView router={router} /></div>
        <GuardLog />
      </div>
    </div>
  );
}
