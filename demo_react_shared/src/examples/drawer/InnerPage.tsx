import React from 'react';
import { useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import './InnerPage.scss?scoped';

export default function InnerPage(): React.ReactElement {
  const router = useRouter()!;
  const { t } = useDemoRuntime();
  return <section className="drawer-inner-page">
    <h4>{t('drawerInnerTitle')}</h4>
    <p>{t('drawerInnerHint')}</p>
    <button type="button" onClick={() => router.back()}>{t('drawerCloseDetails')}</button>
  </section>;
}
