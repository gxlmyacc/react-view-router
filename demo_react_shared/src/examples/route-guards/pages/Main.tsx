import React from 'react';
import { RouterLink, RouterView } from 'react-view-router';
import { useDemoRuntime } from '../../../workspace/context';
import './Main.scss?scoped';

export default function Main(): React.ReactElement {
  const { t } = useDemoRuntime();
  return (
    <section className="page page-nested">
      <h4>{t('mainTitle')}</h4>
      <nav>
        <RouterLink to="some" append>{t('someShort')}</RouterLink>
        <RouterLink to="other" append>{t('otherShort')}</RouterLink>
      </nav>
      <RouterView />
      <RouterView name="footer" />
    </section>
  );
}
