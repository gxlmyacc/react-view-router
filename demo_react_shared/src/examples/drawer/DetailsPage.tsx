import React from 'react';
import { RouterView, useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import './DetailsPage.scss?scoped';

export default function DetailsPage(): React.ReactElement {
  const router = useRouter()!;
  const { t } = useDemoRuntime();

  return (
    <section className="drawer-details-page">
      <h3>{t('drawerDetailsTitle')}</h3>
      <p>{t('drawerDetailsText')}</p>
      <p><code>{router.currentRoute?.fullPath}</code></p>
      <button type="button" onClick={() => router.back()}>
        {t('drawerCloseDetails')}
      </button>
      <button type="button" onClick={() => router.push('/home/details/content')}>
        {t('drawerOpenContent')}
      </button>
      <RouterView />
    </section>
  );
}
