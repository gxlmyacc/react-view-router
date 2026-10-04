import React, { useCallback, useEffect, useState } from 'react';
import { useManualRouter, useRoute } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import TransitionRouterView from 'react-view-router/transition';
import { useDemoRuntime } from '../../workspace/context';
import { KeepAliveLogContext } from './context';
import router from './history';
import routes from './routes';
import './App.scss?scoped';

interface KeepAliveAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function KeepAliveApp({ basename, mode }: KeepAliveAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const [events, setEvents] = useState<string[]>([]);
  const [animate, setAnimate] = useState(false);
  const route = useRoute(router, { watch: true });
  const { start } = useManualRouter(router, {
    basename,
    mode,
    routes,
    manual: true,
  });
  const record = useCallback((event: string) => {
    setEvents(previous => previous.concat(event));
  }, []);
  useEffect(() => start(), [start]);

  return (
    <KeepAliveLogContext.Provider value={record}>
      <div className="keep-alive-example">
        <nav className="keep-alive-actions">
          <button type="button" className={route?.path === '/draft' ? 'is-active' : ''} onClick={() => router.push('/draft')}>
            {t('keepAliveOpenDraft')}
          </button>
          <button type="button" className={route?.path === '/preview' ? 'is-active' : ''} onClick={() => router.push('/preview')}>
            {t('keepAliveOpenPreview')}
          </button>
          <label className="keep-alive-animation">
            <input type="checkbox" checked={animate} onChange={event => setAnimate(event.target.checked)} />
            {t('keepAliveAnimation')}
          </label>
        </nav>
        <div className="keep-alive-layout">
          <div className="keep-alive-view">
            <TransitionRouterView
              router={router}
              transition={animate ? 'slide' : 'none'}
              containerStyle={{ height: '100%', padding: 18, boxSizing: 'border-box' }}
            />
          </div>
          <aside className="keep-alive-log">
            <strong>{t('keepAliveEventLog')}</strong>
            <p>{t('keepAliveEventHelp')}</p>
            <ol>{events.map((event, index) => <li key={index}>{t(`keepAliveEvent_${event}`)}</li>)}</ol>
          </aside>
        </div>
      </div>
    </KeepAliveLogContext.Provider>
  );
}
