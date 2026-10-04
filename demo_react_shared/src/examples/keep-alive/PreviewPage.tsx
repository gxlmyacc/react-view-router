import React from 'react';
import { useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import './PreviewPage.scss?scoped';

export default function PreviewPage(): React.ReactElement {
  const { t } = useDemoRuntime();
  const router = useRouter()!;
  return (
    <section className="keep-alive-preview-page">
      <h3>{t('keepAlivePreviewTitle')}</h3>
      <p>{t('keepAlivePreviewText')}</p>
      <button type="button" onClick={() => router.back()}>{t('keepAliveReturn')}</button>
    </section>
  );
}
