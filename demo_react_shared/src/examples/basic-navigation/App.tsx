import React, { useEffect } from 'react';
import {
  RouterLink, RouterView, useManualRouter, useRoute,
} from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import routes from './routes';
import './App.scss?scoped';

interface BasicNavigationAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function BasicNavigationApp({ basename, mode }: BasicNavigationAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  const route = useRoute(router, { watch: true });
  useEffect(() => start(), [start]);
  return (
    <div className="basic-navigation-example">
      <nav>
        <RouterLink router={router} to="/home">{t('openHome')}</RouterLink>
        <RouterLink router={router} to="/users/42">{t('openUser')}</RouterLink>
        <RouterLink router={router} to="/settings">{t('openSettings')}</RouterLink>
      </nav>
      <div className="programmatic-actions">
        <button type="button" onClick={() => router.push('/users/7')}>{t('pushUser')}</button>
        <button type="button" onClick={() => router.replace('/settings')}>{t('replaceSettings')}</button>
        <button
          type="button"
          onClick={() => router.push({ path: '/architecture', absolute: true })}
        >{t('openHostArchitecture')}</button>
      </div>
      <div className="route-inspector"><strong>{t('moduleCurrentRoute')}</strong><code>{route ? route.fullPath : '—'}</code></div>
      <div className="module-preview">
        <RouterView router={router} viewMessage={t('routerViewPropValue')} />
      </div>
    </div>
  );
}
