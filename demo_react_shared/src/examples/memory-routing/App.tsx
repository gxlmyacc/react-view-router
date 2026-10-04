import React, { useEffect } from 'react';
import {
  HistoryType, RouterView, useManualRouter, useRoute,
} from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import {
  externalMemoryHistory, externalMemoryRouter, internalMemoryRouter,
} from './history';
import createMemoryRoutes from './routes';
import './App.scss?scoped';

const internalRoutes = createMemoryRoutes();
const externalRoutes = createMemoryRoutes();

export default function MemoryRoutingApp(): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start: startInternal } = useManualRouter(internalMemoryRouter, {
    mode: HistoryType.memory,
    pathname: '/home',
    routes: internalRoutes,
    manual: true,
  });
  const { start: startExternal } = useManualRouter(externalMemoryRouter, {
    mode: externalMemoryHistory,
    routes: externalRoutes,
    manual: true,
  });
  const internalRoute = useRoute(internalMemoryRouter, { watch: true });
  const externalRoute = useRoute(externalMemoryRouter, { watch: true });

  useEffect(() => {
    startInternal();
    startExternal();
  }, [startExternal, startInternal]);

  return (
    <div className="memory-routing-example">
      <article>
        <header>
          <h3>{t('ownedMemoryTitle')}</h3>
          <p>{t('ownedMemoryDescription')}</p>
        </header>
        <div className="memory-actions">
          <button type="button" onClick={() => internalMemoryRouter.push('/home')}>{t('memoryHome')}</button>
          <button type="button" onClick={() => internalMemoryRouter.push('/details')}>{t('memoryDetails')}</button>
          <button type="button" onClick={() => internalMemoryRouter.back()}>{t('memoryBack')}</button>
        </div>
        <code>{internalRoute?.fullPath || '—'}</code>
        <RouterView router={internalMemoryRouter} />
      </article>
      <article>
        <header>
          <h3>{t('externalMemoryTitle')}</h3>
          <p>{t('externalMemoryDescription')}</p>
        </header>
        <div className="memory-actions">
          <button type="button" onClick={() => externalMemoryHistory.push('/home')}>{t('externalHistoryHome')}</button>
          <button type="button" onClick={() => externalMemoryHistory.push('/details')}>{t('externalHistoryDetails')}</button>
          <button type="button" onClick={() => externalMemoryRouter.back()}>{t('memoryBack')}</button>
        </div>
        <code>{externalRoute?.fullPath || '—'}</code>
        <p className="history-identity">
          {t('sharedHistoryIdentity')}: <strong>{String(externalMemoryRouter.history === externalMemoryHistory)}</strong>
        </p>
        <RouterView router={externalMemoryRouter} />
      </article>
    </div>
  );
}
