import { useRoute } from 'react-view-router';
import React, { useEffect, useRef, useState } from 'react';
import { loadExampleSources } from '../workspace/example-source';
import { createExampleWorkspace } from './example-workspace';
import CodeWorkspace from '../workspace/components/CodeWorkspace';
import { useDemoRuntime } from '../workspace/context';
import defaultWorkspace from './default-source';
import type { PlaygroundWorkspace } from './default-source';
import {
  PLAYGROUND_COMPILE, PLAYGROUND_COMPILED, PLAYGROUND_READY,
  PLAYGROUND_RESULT, PLAYGROUND_RUN,
} from './protocol';
import type { CompileResponse } from './protocol';
import './PlaygroundPage.scss?scoped';

type PlaygroundStatus = 'idle'|'loading'|'compiling'|'running'|'success'|'error';

interface CompiledWorkspace {
  code: string;
  css: string;
}

const STORAGE_KEY = 'react-view-router.playground.workspace.v2';

function cloneDefaultWorkspace(): PlaygroundWorkspace {
  return JSON.parse(JSON.stringify(defaultWorkspace)) as PlaygroundWorkspace;
}

function readWorkspace(): PlaygroundWorkspace {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneDefaultWorkspace();
    const workspace = JSON.parse(stored) as PlaygroundWorkspace;
    if (!workspace.entry || !Array.isArray(workspace.files) || !workspace.files.length) {
      return cloneDefaultWorkspace();
    }
    return workspace;
  } catch (_error) {
    return cloneDefaultWorkspace();
  }
}

function createChannel(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function PlaygroundPage(): React.ReactElement {
  const { t, locale } = useDemoRuntime();
  const route = useRoute(undefined, { watch: true, ignoreSamePath: false });
  const exampleId = typeof route?.query.exampleId === 'string' ? route.query.exampleId : '';
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const originalWorkspaceRef = useRef<PlaygroundWorkspace | null>(null);
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [status, setStatus] = useState<PlaygroundStatus>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [codeCollapsed, setCodeCollapsed] = useState(false);
  const channelRef = useRef(createChannel());
  const requestIdRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const compiledWorkspaceRef = useRef<CompiledWorkspace | null>(null);

  useEffect(() => {
    if (!exampleId) {
      originalWorkspaceRef.current = null;
      return undefined;
    }
    let cancelled = false;
    originalWorkspaceRef.current = null;
    setStatus('loading');
    setErrors([]);
    compiledWorkspaceRef.current = null;
    requestIdRef.current += 1;
    loadExampleSources().then(manifest => {
      const source = manifest[`demo_react_shared/src/examples/${exampleId}`];
      if (!source) throw new Error(`Unknown example: ${exampleId}`);
      if (cancelled) return;
      const next = createExampleWorkspace(exampleId, source, localeRef.current);
      originalWorkspaceRef.current = next;
      setWorkspace(next);
      setStatus('idle');
    }).catch(error => {
      if (!cancelled) {
        setErrors([error instanceof Error ? error.message : String(error)]);
        setStatus('error');
      }
    });
    return () => { cancelled = true; };
  }, [exampleId]);

  const sendToPreview = (compiled: CompiledWorkspace): void => {
    const frameWindow = frameRef.current?.contentWindow;
    if (!frameWindow) return;
    setStatus('running');
    frameWindow.postMessage({
      type: PLAYGROUND_RUN,
      channel: channelRef.current,
      code: compiled.code,
      css: compiled.css,
    }, '*');
  };

  useEffect(() => {
    const workerUrl = new URL('playground/compiler-worker.js', document.baseURI).toString();
    const worker = new Worker(workerUrl);
    workerRef.current = worker;
    worker.addEventListener('message', event => {
      const response = event.data as CompileResponse;
      if (response.type !== PLAYGROUND_COMPILED || response.id !== requestIdRef.current) return;
      if (response.diagnostics.length) {
        setErrors(response.diagnostics);
        setStatus('error');
        return;
      }
      const compiled = { code: response.code, css: response.css };
      compiledWorkspaceRef.current = compiled;
      setErrors([]);
      sendToPreview(compiled);
    });
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const message = event.data || {};
      if (message.channel !== channelRef.current) return;
      if (message.type === PLAYGROUND_READY && compiledWorkspaceRef.current) {
        sendToPreview(compiledWorkspaceRef.current);
      } else if (message.type === PLAYGROUND_RESULT) {
        setStatus(message.ok ? 'success' : 'error');
        setErrors(message.ok ? [] : [message.error || t('playgroundUnknownError')]);
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [t]);

  const updateFile = (path: string, content: string): void => {
    setWorkspace(current => ({
      ...current,
      files: current.files.map(file => (file.path === path ? { ...file, content } : file)),
    }));
  };

  const run = (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    setStatus('compiling');
    setErrors([]);
    requestIdRef.current += 1;
    workerRef.current?.postMessage({
      type: PLAYGROUND_COMPILE,
      id: requestIdRef.current,
      entry: workspace.entry,
      files: workspace.files,
    });
  };

  const reset = (): void => {
    const nextWorkspace = originalWorkspaceRef.current || cloneDefaultWorkspace();
    localStorage.removeItem(STORAGE_KEY);
    setWorkspace(nextWorkspace);
    setStatus('idle');
    setErrors([]);
  };

  const frameSource = `${window.location.pathname}${window.location.search}`
    + `#/__playground-runtime?channel=${encodeURIComponent(channelRef.current)}`;

  return (
    <section className="playground-page">
      <header className="playground-toolbar">
        <div>
          <h2>{t('playgroundTitle')}</h2>
          <p>{t('playgroundDescription')}</p>
        </div>
        <div className="playground-actions">
          <span className={`playground-status is-${status}`}>{t(`playgroundStatus_${status}`)}</span>
          <button
            type="button"
            aria-pressed={codeCollapsed}
            onClick={() => setCodeCollapsed(current => !current)}
          >{t(codeCollapsed ? 'playgroundExpandCode' : 'playgroundCollapseCode')}</button>
          <button type="button" disabled={status === 'loading' || Boolean(exampleId && !originalWorkspaceRef.current)}
            onClick={reset}>{t('playgroundReset')}</button>
          <button className="is-primary" type="button" disabled={status === 'loading' || Boolean(exampleId && !originalWorkspaceRef.current)}
            onClick={run}>{t('playgroundRun')}</button>
        </div>
      </header>
      <div className={`playground-grid${codeCollapsed ? ' is-code-collapsed' : ''}`}>
        <CodeWorkspace
          className="playground-workspace"
          editable
          entry={workspace.entry}
          files={workspace.files}
          onChange={updateFile}
        />
        <div className="playground-preview">
          <strong>{t('playgroundPreview')}</strong>
          <iframe
            key={exampleId}
            ref={frameRef}
            title={t('playgroundPreview')}
            src={frameSource}
            sandbox="allow-scripts"
          />
        </div>
      </div>
      {errors.length > 0 && <pre className="playground-errors">{errors.join('\n')}</pre>}
      <p className="playground-security">{t('playgroundSecurity')}</p>
    </section>
  );
}
