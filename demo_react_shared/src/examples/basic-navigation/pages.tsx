import React from 'react';
import { useMatchedRoute, useRouteParams } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';

export function ModuleHome(): React.ReactElement {
  const { t } = useDemoRuntime();
  return <section><h3>{t('navigationHomeTitle')}</h3><p>{t('navigationHomeText')}</p></section>;
}

interface UserDetailsProps {
  userId?: string;
  propSource?: string;
  viewMessage?: string;
}

export function UserDetails({ userId: userIdProp, propSource, viewMessage }: UserDetailsProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { userId } = useRouteParams<{ userId: string }>();
  const matchedRoute = useMatchedRoute();
  return (
    <section>
      <h3>{t('userTitle')}</h3>
      <p>{t('userId')}: <strong>{userId}</strong></p>
      <dl>
        <dt>{t('routeParamsHook')}</dt><dd>{userId}</dd>
        <dt>{t('paramsPropsValue')}</dt><dd>{userIdProp}</dd>
        <dt>{t('defaultPropsValue')}</dt><dd>{propSource}</dd>
        <dt>{t('routerViewPropsValue')}</dt><dd>{viewMessage}</dd>
        <dt>{t('computedMetaValue')}</dt><dd>{matchedRoute?.metaComputed.computedLabel}</dd>
      </dl>
    </section>
  );
}

export function Settings(): React.ReactElement {
  const { t } = useDemoRuntime();
  return <section><h3>{t('settingsTitle')}</h3><p>{t('settingsText')}</p></section>;
}
