import React from 'react';
import { useDemoRuntime } from '../../workspace/context';

export default function Overview(): React.ReactElement {
  const { t } = useDemoRuntime();
  return <section><h3>{t('indexOverviewTitle')}</h3><p>{t('indexOverviewText')}</p></section>;
}

export function RedirectTarget(): React.ReactElement {
  const { t } = useDemoRuntime();
  return <section><h3>{t('redirectTargetTitle')}</h3><p>{t('redirectTargetText')}</p></section>;
}
