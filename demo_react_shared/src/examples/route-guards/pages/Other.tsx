import React from 'react';
import { useRouter } from 'react-view-router';
import type ReactViewRouter from 'react-view-router';
import { useDemoRuntime } from '../../../workspace/context';
import type { Translator } from '../../../workspace/i18n';
import './Other.scss?scoped';

interface OtherProps {
  router: ReactViewRouter;
  t: Translator;
}

export class RouteComponentClass extends React.Component<OtherProps> {
  refresh(): void {}

  render() {
    const { router, t } = this.props;
    return (
      <div className="route-card">
        <h5>{t('otherTitle')}</h5>
        <button type="button" onClick={() => router.push('some')}>{t('openSome')}</button>
      </div>
    );
  }
}

export default React.forwardRef<RouteComponentClass, Record<string, never>>(function Other(
  _props,
  ref,
) {
  const router = useRouter();
  const { t } = useDemoRuntime();
  if (!router) return null;
  return <RouteComponentClass router={router} t={t} ref={ref} />;
});
