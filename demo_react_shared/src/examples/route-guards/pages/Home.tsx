import React from 'react';
import { RouterView } from 'react-view-router';
import { useDemoRuntime } from '../../../workspace/context';
import './Home.scss?scoped';

export default function Home(): React.ReactElement {
  const { t } = useDemoRuntime();
  return (
    <section className="page">
      <h3>{t('homeTitle')}</h3>
      <RouterView />
    </section>
  );
}
