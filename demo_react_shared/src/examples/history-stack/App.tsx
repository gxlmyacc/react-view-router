import React, { useEffect } from 'react';
import { RouterView, useManualRouter, useRoute } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import routes from './routes';
import './App.scss?scoped';

interface HistoryStackAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function HistoryStackApp({ basename, mode }: HistoryStackAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  const route = useRoute(router, { watch: true });
  useEffect(() => start(), [start]);
  return (
    <div className="history-stack-example">
      <div className="history-status">
        <span>{t('moduleCurrentRoute')}: <code>{route?.fullPath || '—'}</code></span>
        <span>{t('recordedRouteStacks')}: <strong>{router.stacks.length}</strong></span>
      </div>
      <RouterView router={router} />
    </div>
  );
}
