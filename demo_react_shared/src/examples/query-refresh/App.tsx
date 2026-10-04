import React, { useEffect } from 'react';
import { RouterView, useManualRouter, useRoute } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import routes from './routes';
import './App.scss?scoped';

interface QueryRefreshAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function QueryRefreshApp({ basename, mode }: QueryRefreshAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  const route = useRoute(router, { watch: true });
  useEffect(() => start(), [start]);
  return (
    <div className="query-refresh-example">
      <div className="query-actions">
        <button type="button" onClick={() => router.push('/unauthorized?module=finance')}>{t('openFinanceDenied')}</button>
        <button type="button" onClick={() => router.push('/unauthorized?module=hr')}>{t('openHrDenied')}</button>
      </div>
      <div className="query-url"><strong>{t('moduleCurrentRoute')}</strong><code>{route ? route.fullPath : '—'}</code></div>
      <div className="query-preview"><RouterView router={router} /></div>
    </div>
  );
}
