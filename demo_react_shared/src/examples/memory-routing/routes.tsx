import React from 'react';
import { normalizeRoutes, useRoute, useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';

function MemoryPage({ page }: { page: 'home'|'details' }): React.ReactElement {
  const { t } = useDemoRuntime();
  const router = useRouter();
  const route = useRoute(router, { watch: true });
  return (
    <section className="memory-page">
      <h3>{page === 'home' ? t('memoryHome') : t('memoryDetails')}</h3>
      <dl>
        <dt>{t('moduleCurrentRoute')}</dt><dd>{route?.fullPath || '—'}</dd>
        <dt>{t('memoryHistoryIndex')}</dt><dd>{router?.history.index}</dd>
      </dl>
    </section>
  );
}

export default function createMemoryRoutes() {
  return normalizeRoutes([
    { path: '/', index: 'home' },
    { path: 'home', component: () => <MemoryPage page="home" /> },
    { path: 'details', component: () => <MemoryPage page="details" /> },
  ]);
}
