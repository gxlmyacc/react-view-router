import React, { useRef } from 'react';
import { useDemoRuntime } from '../../workspace/context';

interface UnauthorizedPageProps {
  module?: string;
}

export default function UnauthorizedPage({ module = 'finance' }: UnauthorizedPageProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <section className="permission-card">
      <h3>{t('permissionTitle')}</h3>
      <dl>
        <dt>{t('permissionModule')}</dt><dd>{t(module === 'hr' ? 'hrModule' : 'financeModule')}</dd>
        <dt>{t('permissionRenderCount')}</dt><dd>{renderCount.current}</dd>
      </dl>
    </section>
  );
}
