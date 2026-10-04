import React, { useEffect, useState } from 'react';
import type { SiteRouteEntry } from '../navigation';
import type { Translator } from '../i18n';
import { loadExampleSources, localizeExampleSource } from '../example-source';
import type { ExampleSourceWorkspace } from '../example-source';
import CodeWorkspace from './CodeWorkspace';
import './ExampleIntro.scss?scoped';

interface ExampleIntroProps {
  entry: SiteRouteEntry;
  t: Translator;
  onDebug?(exampleId: string): void;
}

interface LoadedExampleSource {
  source: string;
  workspace: ExampleSourceWorkspace;
}

export default function ExampleIntro({ entry, t, onDebug }: ExampleIntroProps): React.ReactElement|null {
  const { example } = entry;
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState(false);
  const [loadedSource, setLoadedSource] = useState<LoadedExampleSource>();

  useEffect(() => {
    setSourceOpen(false);
    setSourceError(false);
  }, [example?.source]);

  useEffect(() => {
    if (!sourceOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setSourceOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [sourceOpen]);

  if (!example) return null;

  const openSource = (): void => {
    setSourceOpen(true);
    setSourceError(false);
    if (loadedSource?.source === example.source) return;
    setSourceLoading(true);
    loadExampleSources().then(manifest => {
      const workspace = manifest[example.source];
      if (!workspace) throw new Error(`Unknown example source: ${example.source}`);
      setLoadedSource({ source: example.source, workspace });
    }).catch(() => setSourceError(true)).finally(() => setSourceLoading(false));
  };

  return (
    <section className="example-intro">
      <div className="example-intro-copy">
        <div className="example-intro-heading">
          <span>{t('examplePurpose')}</span>
          <button className="example-source-button" onClick={openSource} type="button">
            {t('viewSource')}
          </button>
        </div>
        <h2>{t(entry.title)}</h2>
        <p>{t(example.description)}</p>
      </div>
      <div className="example-intro-details">
        <div>
          <strong>{t('exampleScenarios')}</strong>
          <ol>{example.scenarios.map(item => <li key={item}>{t(item)}</li>)}</ol>
        </div>
        <div>
          <strong>{t('relatedApis')}</strong>
          <div className="api-tags">{example.apis.map(api => <code key={api}>{api}</code>)}</div>
          <small className="example-source-summary">
            {t('sourceCode')}: <code>{example.source}</code>
          </small>
        </div>
      </div>
      {sourceOpen && (
        <div
          aria-label={t('sourceFiles')}
          aria-modal="true"
          className="example-source-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSourceOpen(false);
          }}
          role="dialog"
        >
          <section className="example-source-dialog">
            <header>
              <div>
                <strong>{t(entry.title)}</strong>
                <code>{example.source}</code>
              </div>
              <div className="example-source-actions">
                {onDebug && <button type="button" disabled={sourceLoading || sourceError || loadedSource?.source !== example.source}
                  onClick={() => {
                    setSourceOpen(false);
                    onDebug(example.source.split('/').pop()!);
                  }}>{t('debugExample')}</button>}
                <button onClick={() => setSourceOpen(false)} type="button">{t('closeSource')}</button>
              </div>
            </header>
            <div className="example-source-body">
              {sourceLoading && <p>{t('sourceLoading')}</p>}
              {sourceError && <p className="is-error">{t('sourceUnavailable')}</p>}
              {loadedSource?.source === example.source && (
                <CodeWorkspace
                  entry={loadedSource.workspace.entry}
                  files={loadedSource.workspace.files.map(file => ({
                    ...file, content: localizeExampleSource(file, t),
                  }))}
                />
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
