import React from 'react';
import { useRouter } from 'react-view-router';
import type ReactViewRouter from 'react-view-router';
import { useDemoRuntime } from '../../../workspace/context';
import type { Translator } from '../../../workspace/i18n';
import './Some.scss?scoped';

interface SomeProps {
  router: ReactViewRouter;
  t: Translator;
}

interface SomeState {
  refreshed: boolean;
}

export class RouteComponentClass extends React.Component<SomeProps, SomeState> {
  constructor(props: SomeProps) {
    super(props);
    this.state = { refreshed: false };
  }

  refresh(): void {
    this.setState({ refreshed: true });
  }

  render() {
    const { router, t } = this.props;
    return (
      <div className="route-card">
        <h5>{t('someTitle')}</h5>
        <p>{t(this.state.refreshed ? 'refreshedCallback' : 'waitingCallback')}</p>
        <button type="button" onClick={() => router.push('other')}>{t('openOther')}</button>
      </div>
    );
  }
}

export default React.forwardRef<RouteComponentClass, Record<string, never>>(function Some(
  _props,
  ref,
) {
  const router = useRouter();
  const { t } = useDemoRuntime();
  if (!router) return null;
  return <RouteComponentClass router={router} t={t} ref={ref} />;
});
