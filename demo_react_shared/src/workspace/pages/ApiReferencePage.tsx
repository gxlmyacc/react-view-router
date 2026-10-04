import React, { useEffect, useRef, useState } from 'react';
import { useRoute, useRouter } from 'react-view-router';
import MarkdownDocument from '../components/MarkdownDocument';
import { useDemoRuntime } from '../context';
import './ApiReferencePage.scss?scoped';

interface LocalizedDocument {
  en: string;
  zh: string;
}

type ReferenceDocuments = Record<string, LocalizedDocument>;

let apiDocumentsRequest: Promise<ReferenceDocuments>|undefined;

function loadApiDocuments(): Promise<ReferenceDocuments> {
  if (!apiDocumentsRequest) {
    const url = new URL('reference/api-documents.json', document.baseURI).toString();
    apiDocumentsRequest = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Unable to load API documents (${response.status})`);
      return response.json() as Promise<ReferenceDocuments>;
    }).catch(error => {
      apiDocumentsRequest = undefined;
      throw error;
    });
  }
  return apiDocumentsRequest;
}

export default function ApiReferencePage(): React.ReactElement {
  const { locale, setLocale, t } = useDemoRuntime();
  const router = useRouter();
  const route = useRoute(router, { watch: true });
  const requestedDocument = route?.query.document;
  const documentPath = typeof requestedDocument === 'string' && requestedDocument
    ? requestedDocument : 'docs/api.md';
  const [documents, setDocuments] = useState<ReferenceDocuments>();
  const [failed, setFailed] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    setFailed(false);
    loadApiDocuments().then(result => {
      if (active) setDocuments(result);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [documentPath, locale]);

  const navigateDocument = (href: string): boolean => {
    if (href.charAt(0) === '#') {
      const heading = document.getElementById(decodeURIComponent(href.slice(1)));
      if (heading) heading.scrollIntoView({ behavior: 'smooth' });
      return Boolean(heading);
    }
    if (!/^\.\.?\//.test(href) || !documents || !router) return false;
    const target = new URL(href, `https://reference.invalid/${documentPath}`);
    const targetPath = decodeURIComponent(target.pathname.slice(1)).replace(/_CN\.md$/, '.md');
    if (!documents[targetPath]) return false;

    if (targetPath === documentPath && /_CN\.md(?:#|$)/.test(href)) setLocale?.('zh');
    else if (targetPath === documentPath && /\.md(?:#|$)/.test(href)) setLocale?.('en');
    if (targetPath !== documentPath) router.push({ path: '/api', query: { document: targetPath } });
    else if (target.hash) {
      document.getElementById(decodeURIComponent(target.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
    }
    return true;
  };

  if (failed) {
    return (
      <article className="api-document-page">
        <h2>{t('apiReference')}</h2>
        <p className="api-document-message is-error">{t('apiDocumentUnavailable')}</p>
      </article>
    );
  }
  if (!documents) {
    return (
      <article className="api-document-page">
        <h2>{t('apiReference')}</h2>
        <p className="api-document-message">{t('apiDocumentLoading')}</p>
      </article>
    );
  }
  const currentDocument = documents[documentPath];
  if (!currentDocument) {
    return <article className="api-document-page"><p className="api-document-message is-error">{t('apiDocumentUnavailable')}</p></article>;
  }
  const sourcePath = documentPath.replace(/\.md$/, locale === 'zh' && currentDocument.zh !== currentDocument.en ? '_CN.md' : '.md');
  return (
    <section className="api-document-page" ref={scrollRef}>
      <div className="api-document-source-note">
        <span>{documentPath === 'docs/api.md' ? t('apiDocumentSourceNote')
          : t('guideDocumentSourceNote').replace('{file}', sourcePath)}</span>
        {documentPath !== 'docs/api.md' && (
          <button type="button" onClick={() => router?.push('/api')}>{t('apiReturnToReference')}</button>
        )}
      </div>
      <MarkdownDocument
        source={currentDocument[locale]}
        tableOfContentsLabel={t('apiDocumentContents')}
        onLinkClick={navigateDocument}
      />
    </section>
  );
}
