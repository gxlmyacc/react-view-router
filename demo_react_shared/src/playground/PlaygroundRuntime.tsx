import React, { useEffect, useState } from 'react';
import * as ReactViewRouterRuntime from 'react-view-router';
import * as ReactDOMRuntime from 'react-dom';
import RouterDrawer from 'react-view-router/drawer';
import renderUtils from 'react-view-router/dom';
import * as TransitionRuntime from 'react-view-router/transition';
import {
  PLAYGROUND_READY, PLAYGROUND_RESULT, PLAYGROUND_RUN,
} from './protocol';
import type { RuntimeMessage } from './protocol';
import './PlaygroundRuntime.scss';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  onError(error: Error): void;
}
interface ErrorBoundaryState { error: string }

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error: error.message || String(error) };
  }

  componentDidCatch(error: Error): void {
    this.props.onError(error);
  }

  render(): React.ReactNode {
    if (this.state.error) return <pre className="playground-runtime-error">{this.state.error}</pre>;
    return this.props.children;
  }
}

function readChannel(): string {
  const match = window.location.hash.match(/[?&]channel=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default function PlaygroundRuntime(): React.ReactElement {
  const [{ component, revision }, setPreview] = useState<{ component: React.ComponentType | null; revision: number }>({
    component: null, revision: 0,
  });
  const [runtimeError, setRuntimeError] = useState('');
  const channel = readChannel();

  useEffect(() => {
    const announceReady = () => window.parent.postMessage({ type: PLAYGROUND_READY, channel }, '*');
    const readyTimer = window.setInterval(announceReady, 250);
    const receive = (event: MessageEvent) => {
      const message = event.data as RuntimeMessage;
      if (event.source !== window.parent
        || !message || message.type !== PLAYGROUND_RUN || message.channel !== channel) return;
      window.clearInterval(readyTimer);
      try {
        let playgroundStyle = document.querySelector('style[data-playground-style]') as HTMLStyleElement | null;
        if (!playgroundStyle) {
          playgroundStyle = document.createElement('style');
          playgroundStyle.setAttribute('data-playground-style', 'true');
          document.head.appendChild(playgroundStyle);
        }
        playgroundStyle.textContent = message.css || '';
        // User code is evaluated only inside the sandboxed preview iframe.
        // eslint-disable-next-line no-new-func
        const createComponent = new Function(
          'React',
          'ReactViewRouterLib',
          'PlaygroundModules',
          `'use strict';\n${message.code}`,
        ) as (react: typeof React, router: typeof ReactViewRouterRuntime, modules: Record<string, unknown>) => React.ComponentType;
        const nextComponent = createComponent(React, ReactViewRouterRuntime, {
          'react-dom': ReactDOMRuntime,
          'react-view-router/drawer': { __esModule: true, default: RouterDrawer },
          'react-view-router/dom': { __esModule: true, default: renderUtils },
          'react-view-router/transition': { ...TransitionRuntime, __esModule: true },
        });
        if (typeof nextComponent !== 'function') throw new Error('PlaygroundApp must be a React component.');
        setRuntimeError('');
        setPreview(current => ({ component: nextComponent, revision: current.revision + 1 }));
        window.parent.postMessage({ type: PLAYGROUND_RESULT, channel, ok: true }, '*');
      } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error);
        setRuntimeError(messageText);
        window.parent.postMessage({ type: PLAYGROUND_RESULT, channel, ok: false, error: messageText }, '*');
      }
    };
    window.addEventListener('message', receive);
    announceReady();
    return () => {
      window.clearInterval(readyTimer);
      window.removeEventListener('message', receive);
    };
  }, [channel]);

  const reportRenderError = (error: Error): void => {
    window.parent.postMessage({
      type: PLAYGROUND_RESULT,
      channel,
      ok: false,
      error: error.message || String(error),
    }, '*');
  };

  return (
    <div className="playground-runtime-root">
      {runtimeError && <pre className="playground-runtime-error">{runtimeError}</pre>}
      {!runtimeError && component && (
        <ErrorBoundary key={revision} onError={reportRenderError}>
          {React.createElement(component)}
        </ErrorBoundary>
      )}
    </div>
  );
}
