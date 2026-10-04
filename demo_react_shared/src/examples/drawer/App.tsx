import React, { useCallback, useEffect, useState } from 'react';
import { RouterView, useManualRouter, useRoute } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import routes from './routes';
import { DrawerLogContext } from './context';
import type { DrawerLifecycleEvent } from './context';
import './App.scss?scoped';

interface DrawerAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function DrawerApp({ basename, mode }: DrawerAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  const route = useRoute(router, { watch: true });
  const [events, setEvents] = useState<DrawerLifecycleEvent[]>([]);
  const record = useCallback((event: DrawerLifecycleEvent) => {
    setEvents(previous => previous.concat(event));
  }, []);

  useEffect(() => start(), [start]);

  return (
    <section className="drawer-example">
      <p>{t('drawerDemoHint')}</p>
      <p className="drawer-route">{t('moduleCurrentRoute')}: <code>{route?.fullPath || '—'}</code></p>
      <div className="drawer-layout">
        <div className="drawer-view">
          <DrawerLogContext.Provider value={record}>
            <RouterView router={router} />
          </DrawerLogContext.Provider>
        </div>
        <aside className="drawer-log" aria-label={t('drawerEventLog')}>
          <strong>{t('drawerEventLog')}</strong>
          <p>{t('drawerEventHelp')}</p>
          <ol>{events.map((event, index) => <li key={index}>{t(`drawerEvent_${event}`)}</li>)}</ol>
        </aside>
      </div>
    </section>
  );
}
