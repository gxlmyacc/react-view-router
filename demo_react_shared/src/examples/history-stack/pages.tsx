import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';

function IframePanel({ frameWindow }: { frameWindow: Window }): React.ReactElement {
  const { t } = useDemoRuntime();
  const [currentStep, setCurrentStep] = useState(0);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const updateStep = () => {
      const historyState = frameWindow.history.state as { step?: number } | null;
      setCurrentStep(historyState?.step || 0);
    };
    frameWindow.addEventListener('popstate', updateStep);
    return () => frameWindow.removeEventListener('popstate', updateStep);
  }, [frameWindow]);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return undefined;

    // React 16 delegates synthetic events to the host document. A portal rendered
    // into an iframe has a different document, so bind this one interaction to the
    // iframe element itself. This also keeps the example runnable in React 17-19.
    const pushHistory = () => {
      setCurrentStep((previousStep) => {
        const nextStep = previousStep + 1;
        // about:blank can have an opaque URL in embedded/test environments.
        // Omitting the URL still creates a real joint-session-history entry.
        frameWindow.history.pushState({ step: nextStep }, '');
        return nextStep;
      });
    };
    button.addEventListener('click', pushHistory);
    return () => button.removeEventListener('click', pushHistory);
  }, [frameWindow]);

  return (
    <div style={{ padding: 14, color: '#24422e', background: '#f4fbf2', font: '14px Arial, sans-serif' }}>
      <strong>{t('iframeDocumentTitle')}</strong>
      <p>{t('iframeDocumentText')}</p>
      <button
        ref={buttonRef}
        type="button"
        style={{ padding: '7px 10px', border: '1px solid #72bd68', borderRadius: 5, background: '#fff', color: '#278f1c' }}
      >
        {t('iframePushHistory')}
      </button>
      <code id="step" style={{ display: 'block', marginTop: 10 }}>#step-{currentStep}</code>
    </div>
  );
}

function HistoryIframe(): React.ReactElement {
  const { t } = useDemoRuntime();
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const frameDocument = frame?.contentDocument;
  const frameWindow = frame?.contentWindow;
  return (
    <>
      <iframe ref={setFrame} title={t('iframeDocumentTitle')} src="about:blank" />
      {frameDocument?.body && frameWindow
        ? createPortal(<IframePanel frameWindow={frameWindow} />, frameDocument.body)
        : null}
    </>
  );
}

export function HistoryStart(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();
  return (
    <section className="history-page">
      <h3>{t('historyStartTitle')}</h3>
      <p>{t('historyStartText')}</p>
      <button type="button" onClick={() => router?.push('/iframe')}>{t('historyOpenIframe')}</button>
    </section>
  );
}

export function IframeHistory(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();

  return (
    <section className="history-page">
      <h3>{t('iframeHistoryTitle')}</h3>
      <p>{t('iframeHistoryText')}</p>
      <HistoryIframe />
      <button type="button" onClick={() => router?.push('/finish')}>{t('historyOpenFinish')}</button>
    </section>
  );
}

export function HistoryFinish(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();
  const supportsNavigation = typeof window !== 'undefined'
    && Boolean((window as Window & { navigation?: unknown }).navigation);
  return (
    <section className="history-page">
      <h3>{t('historyFinishTitle')}</h3>
      <p>{t('historyFinishText')}</p>
      <p className="navigation-support">
        {t('navigationApiSupport')}: <strong>{supportsNavigation ? t('supported') : t('fallback')}</strong>
      </p>
      <button
        type="button"
        onClick={() => router?.push({ path: '/start', backIfVisited: true })}
      >
        {t('smartBackToStart')}
      </button>
    </section>
  );
}
