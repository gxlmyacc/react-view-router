import React from 'react';
import { useRoute } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';

interface GuardNavigationPageProps {
  titleKey: string;
}

export default function GuardNavigationPage({ titleKey }: GuardNavigationPageProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const route = useRoute();
  return (
    <article className="guard-navigation-page">
      <h3>{t(titleKey)}</h3>
      <code>{route?.fullPath || '—'}</code>
    </article>
  );
}
