import React, { useEffect } from 'react';
import { RouterView, useManualRouter, useRoute } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import routes from './routes';
import LoopProtectionDemo from './LoopProtectionDemo';
import './App.scss?scoped';

interface IndexRedirectAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function IndexRedirectApp({ basename, mode }: IndexRedirectAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  const route = useRoute(router, { watch: true });
  useEffect(() => start(), [start]);
  return (
    <div className="index-redirect-example">
      <div className="index-actions">
        <button type="button" onClick={() => router.push('/').catch(() => undefined)}>{t('openIndexRoot')}</button>
        <button type="button" onClick={() => router.push('/legacy').catch(() => undefined)}>{t('openLegacyRedirect')}</button>
      </div>
      <dl className="route-facts">
        <dt>{t('indexLocation')}</dt><dd><code>{router.history.location.pathname}</code></dd>
        <dt>{t('indexMatched')}</dt>
        <dd>
          <code>{route ? router.currentRoute?.matched.map(item => item.path).join(' → ') : '—'}</code>
        </dd>
      </dl>
      <div className="index-preview"><RouterView router={router} /></div>
      <LoopProtectionDemo />
    </div>
  );
}
