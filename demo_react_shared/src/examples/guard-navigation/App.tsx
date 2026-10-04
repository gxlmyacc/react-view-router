import React, { useEffect, useState } from 'react';
import { RouterView, useManualRouter } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import router from './history';
import routes from './routes';
import { afterEach, beforeEach } from './global-guards';
import { resetGuardNavigationEvents } from './events';
import GuardNavigationLog from './GuardNavigationLog';
import { useDemoRuntime } from '../../workspace/context';
import './App.scss?scoped';

router.beforeEach(beforeEach);
router.afterEach(afterEach);

interface GuardNavigationAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function GuardNavigationApp({ basename, mode }: GuardNavigationAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const [promiseStatus, setPromiseStatus] = useState<'idle'|'pending'|'resolved'|'rejected'>('idle');
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  useEffect(() => {
    resetGuardNavigationEvents();
    start();
  }, [start]);

  const navigate = (path: string) => {
    setPromiseStatus('pending');
    router.push(path).then(
      () => setPromiseStatus('resolved'),
      () => setPromiseStatus('rejected'),
    );
  };
  return (
    <div className="guard-navigation-example">
      <div className="guard-navigation-actions">
        <button type="button" onClick={() => navigate('/same-target')}>{t('guardTrySameTarget')}</button>
        <button type="button" onClick={() => navigate('/global-replace')}>{t('guardTryReplace')}</button>
        <button type="button" onClick={() => navigate('/parent')}>{t('guardTryChildRedirect')}</button>
        <button type="button" onClick={() => navigate('/query-target?version=1')}>{t('guardTryQueryRedirect')}</button>
        <button type="button" onClick={() => navigate('/component-push')}>{t('guardTryPush')}</button>
        <button type="button" onClick={() => navigate('/component-redirect')}>{t('guardTryRedirect')}</button>
        <button type="button" onClick={() => navigate('/blocked')}>{t('guardTryAbort')}</button>
        <button type="button" onClick={() => navigate('/home')}>{t('openHome')}</button>
      </div>
      <p className={`guard-navigation-promise is-${promiseStatus}`}>
        {t('guardOriginalPromise')}: {t(`guardPromise_${promiseStatus}`)}
      </p>
      <div className="guard-navigation-grid">
        <div className="guard-navigation-preview"><RouterView router={router} /></div>
        <GuardNavigationLog />
      </div>
    </div>
  );
}
