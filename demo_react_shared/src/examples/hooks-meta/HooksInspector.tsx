import React, { useCallback, useState } from 'react';
import {
  useMatchedRouteAndIndex,
  useRoute,
  useRouteChanged,
  useRouteMeta,
  useRouteMetaChanged,
  useRouteParams,
  useRouteQuery,
  useRouteState,
  useRouter,
  useRouterView,
} from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';

interface InspectorState {
  note?: string;
}

export default function HooksInspector(): React.ReactElement {
  const { t } = useDemoRuntime();
  const router = useRouter();
  const route = useRoute(undefined, { watch: true });
  const params = useRouteParams<{ reportId?: string }>(undefined, { watch: true });
  const query = useRouteQuery<{ view?: string }>(undefined, { watch: true });
  const [state, setState] = useRouteState<InspectorState>(
    undefined,
    { note: t('hooksStateEmpty') },
    { watch: true },
  );
  const [meta, setMeta] = useRouteMeta(['role', 'status'], undefined, { watch: true });
  const [matched, matchedIndex] = useMatchedRouteAndIndex(undefined, { watch: true });
  const routerView = useRouterView();
  const [routeEvents, setRouteEvents] = useState(0);
  const [metaEvents, setMetaEvents] = useState(0);

  useRouteChanged(router!, useCallback(() => setRouteEvents(value => value + 1), []));
  useRouteMetaChanged(router!, useCallback(() => setMetaEvents(value => value + 1), []), ['status']);

  const openReport = (section: string, reportId: string, view: string) => router?.push({
    path: `/live/inspector/${reportId}`,
    query: { view },
    state: { note: `${section}/${view}` },
  });

  const metaValues = (meta || {}) as Record<string, unknown>;
  return (
    <section className="hooks-inspector">
      <div className="hooks-actions">
        <button
          type="button"
          onClick={() => openReport('finance', 'monthly', 'summary')}
        >{t('hooksFinanceSummary')}</button>
        <button
          type="button"
          onClick={() => openReport('hr', 'employees', 'details')}
        >{t('hooksHrDetails')}</button>
        <button type="button" onClick={() => setState({ note: t('hooksStateUpdated') })}>{t('hooksUpdateState')}</button>
        <button
          type="button"
          onClick={() => setMeta({ status: metaValues.status === 'ready' ? 'reviewing' : 'ready' })}
        >
          {t('hooksToggleMeta')}
        </button>
      </div>
      <dl className="hooks-values">
        <dt>useRouter</dt><dd>{router ? t('hooksRouterAvailable') : '—'}</dd>
        <dt>useRoute</dt><dd>{route?.fullPath || '—'}</dd>
        <dt>useRouteParams</dt><dd>{params.reportId || '—'}</dd>
        <dt>useRouteQuery</dt><dd>{query.view || '—'}</dd>
        <dt>useRouteState</dt><dd>{state.note || '—'}</dd>
        <dt>useRouteMeta</dt><dd>{String(metaValues.role)} / {String(metaValues.status)}</dd>
        <dt>useMatchedRouteAndIndex</dt><dd>#{matchedIndex} {matched?.path || '—'}</dd>
        <dt>matched.metaComputed</dt><dd>{String(matched?.metaComputed.computedSummary || '—')}</dd>
        <dt>useRouterView</dt><dd>{routerView ? t('hooksViewAvailable') : '—'}</dd>
        <dt>useRouteChanged</dt><dd>{routeEvents}</dd>
        <dt>useRouteMetaChanged</dt><dd>{metaEvents}</dd>
      </dl>
    </section>
  );
}
