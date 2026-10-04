import React, { useRef } from 'react';
import CodeBlock from './CodeBlock';
import './CodeEditor.scss';

export interface CodeEditorProps {
  value: string;
  language?: string;
  label: string;
  onChange(value: string): void;
}

export default function CodeEditor({
  value,
  language = 'text',
  label,
  onChange,
}: CodeEditorProps): React.ReactElement {
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const syncScroll = (target: HTMLTextAreaElement): void => {
    const code = highlightRef.current?.querySelector('pre');
    if (!code) return;
    code.scrollTop = target.scrollTop;
    code.scrollLeft = target.scrollLeft;
  };

  return (
    <label className="code-editor">
      <strong>{label}</strong>
      <div className="code-editor-layers">
        <div aria-hidden="true" className="code-editor-highlight" ref={highlightRef}>
          <CodeBlock code={`${value}\n`} language={language} showLanguage={false} />
        </div>
        <textarea
          aria-label={label}
          onChange={event => onChange(event.target.value)}
          onScroll={event => syncScroll(event.currentTarget)}
          spellCheck={false}
          value={value}
        />
      </div>
    </label>
  );
}
