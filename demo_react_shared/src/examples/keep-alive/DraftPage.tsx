import React, { useContext, useEffect, useState } from 'react';
import { useViewActivate, useViewDeactivate } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import { KeepAliveLogContext } from './context';
import './DraftPage.scss?scoped';

export default function DraftPage(): React.ReactElement {
  const { t } = useDemoRuntime();
  const record = useContext(KeepAliveLogContext);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    record('mount');
  }, [record]);
  useViewActivate(() => record('activate'));
  useViewDeactivate(() => record('deactivate'));

  return (
    <section className="keep-alive-draft-page">
      <h3>{t('keepAliveDraftTitle')}</h3>
      <p>{t('keepAliveDraftText')}</p>
      <label htmlFor="keep-alive-draft">{t('keepAliveDraftLabel')}</label>
      <textarea
        id="keep-alive-draft"
        value={draft}
        onChange={event => setDraft(event.target.value)}
        placeholder={t('keepAliveDraftPlaceholder')}
      />
      <p>{t('keepAliveDraftLength')}: <strong>{draft.length}</strong></p>
    </section>
  );
}
