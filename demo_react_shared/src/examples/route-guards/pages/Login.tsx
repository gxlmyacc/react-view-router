import React from 'react';
import { useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../../workspace/context';
import './Login.scss?scoped';

export default function Login(): React.ReactElement | null {
  const router = useRouter();
  const { store, t } = useDemoRuntime();
  if (!router) return null;
  const doLogin = () => {
    store.loggedIn = true;
    router.push('/home/main/some');
  };

  return (
    <section className="page">
      <h3>{t('loginTitle')}</h3>
      <button type="button" onClick={doLogin}>{t('loginAction')}</button>
    </section>
  );
}
