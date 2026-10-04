import React from 'react';
import { useDemoRuntime } from '../../../workspace/context';
import type { Translator } from '../../../workspace/i18n';
import './Footer.scss?scoped';

interface FooterProps {
  t: Translator;
}

export class RouteComponentClass extends React.Component<FooterProps> {
  refresh(): void {}

  render() {
    return <footer className="route-card">{this.props.t('footerOutlet')}</footer>;
  }
}

export default React.forwardRef<RouteComponentClass, Record<string, never>>(function Footer(
  _props,
  ref,
) {
  const { t } = useDemoRuntime();
  return <RouteComponentClass t={t} ref={ref} />;
});
