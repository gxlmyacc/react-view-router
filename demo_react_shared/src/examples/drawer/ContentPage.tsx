import React from 'react';
import { useRouter } from 'react-view-router';
import RouterDrawer from 'react-view-router/drawer';
import { useDemoRuntime } from '../../workspace/context';
import './ContentPage.scss?scoped';

/** Ordinary child view inside the outer drawer; its own child uses a second drawer. */
export default function ContentPage(): React.ReactElement {
  const router = useRouter()!;
  const { t } = useDemoRuntime();
  const [note, setNote] = React.useState('');
  return (
    <section className="drawer-content-page">
      <h4>{t('drawerContentTitle')}</h4>
      <label>{t('drawerParentNote')}<input value={note} onChange={event => setNote(event.target.value)} /></label>
      <button type="button" onClick={() => router.push('/home/details/content/inner')}>{t('drawerOpenInner')}</button>
      <button type="button" onClick={() => router.back()}>{t('drawerBackContent')}</button>
      <RouterDrawer position="right" maxWidth="80%" maskClosable />
    </section>
  );
}
