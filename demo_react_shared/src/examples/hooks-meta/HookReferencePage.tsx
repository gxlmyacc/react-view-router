import React from 'react';
import { useRouteMeta } from 'react-view-router';
import CodeBlock from '../../workspace/components/CodeBlock';
import { useDemoRuntime } from '../../workspace/context';
import { hookReferences, localize } from './hook-reference';

export default function HookReferencePage(): React.ReactElement {
  const { locale, t } = useDemoRuntime();
  const hookMeta = useRouteMeta('hookId', undefined, { watch: true })[0];
  const hookId = hookMeta as unknown as string;
  const reference = hookReferences[hookId];

  if (!reference) return <p>{t('hooksReferenceMissing')}</p>;
  return (
    <article className="hook-reference-page">
      <header>
        <span>{t('hooksReferenceBadge')}</span>
        <h2>{reference.name}</h2>
        <p>{localize(reference.summary, locale)}</p>
      </header>
      <section>
        <h3>{t('hooksSignature')}</h3>
        <CodeBlock code={reference.signature} language="ts" />
      </section>
      <section>
        <h3>{t('hooksParameters')}</h3>
        {reference.parameters.length ? (
          <div className="hook-parameter-table">
            <div className="is-heading"><span>{t('hooksParameter')}</span><span>{t('hooksType')}</span><span>{t('hooksDescription')}</span></div>
            {reference.parameters.map(item => (
              <div key={item.name}>
                <code>{item.name}</code>
                <code>{item.type}</code>
                <span>{localize(item.description, locale)}</span>
              </div>
            ))}
          </div>
        ) : <p>{t('hooksNoParameters')}</p>}
      </section>
      <section>
        <h3>{t('hooksReturns')}</h3>
        <code className="hook-return-value">{localize(reference.returns, locale)}</code>
      </section>
    </article>
  );
}
