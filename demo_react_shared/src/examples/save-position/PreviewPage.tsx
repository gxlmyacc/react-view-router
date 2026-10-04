import React from 'react';
import { useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import './PreviewPage.scss?scoped';

export default function PreviewPage(): React.ReactElement {
  const router = useRouter()!;
  const { t } = useDemoRuntime();
  return (
    <div className="position-preview" data-testid="position-preview">
      <h3>{t('positionPreviewTitle')}</h3>
      <p>{t('positionPreviewText')}</p>
      <button type="button" onClick={() => router.back()}>{t('positionReturn')}</button>
    </div>
  );
}
