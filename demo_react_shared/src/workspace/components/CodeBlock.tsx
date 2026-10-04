import React from 'react';
import './CodeBlock.scss';

type CodeTokenKind = 'comment' | 'keyword' | 'literal' | 'number' | 'operator' | 'property'
  | 'selector' | 'string' | 'tag' | 'text' | 'variable';

export interface CodeToken {
  kind: CodeTokenKind;
  value: string;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLanguage?: boolean;
}

const SCRIPT_TOKEN_PATTERN = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\[\s\S]|[^`])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|<\/?[A-Za-z][\w.-]*|\/?>(?=\s|$)|\b(?:break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|interface|let|new|of|return|switch|throw|try|type|typeof|var|void|while|with|yield|async|await|public|private|protected|readonly|implements|namespace|declare|as)\b|\b(?:true|false|null|undefined)\b|\b(?:0x[\da-f]+|\d+(?:\.\d+)?)\b|=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?\.|[{}()[\].,;:+\-*/%=<>!?&|])/gim;
const STYLE_TOKEN_PATTERN = /(\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\$[\w-]+|@[\w-]+|#[\da-f]{3,8}\b|-?(?:\d*\.)?\d+(?:%|px|r?em|vh|vw|s|ms|deg)?\b|--[\w-]+(?=\s*:)|[A-Za-z-]+(?=\s*:)|[.#][A-Za-z_-][\w-]*|&|[{}()[\]:;,>+~*=])/gim;

function getTokenKind(value: string): CodeTokenKind {
  if (/^\/\*|^\/\//.test(value)) return 'comment';
  if (/^['"`]/.test(value)) return 'string';
  if (/^<\/?[A-Za-z]/.test(value) || /^\/?>$/.test(value)) return 'tag';
  if (/^(true|false|null|undefined)$/i.test(value)) return 'literal';
  if (/^(0x[\da-f]+|\d+(\.\d+)?)$/i.test(value)) return 'number';
  if (/^[A-Za-z]/.test(value)) return 'keyword';
  return 'operator';
}

function getStyleTokenKind(value: string): CodeTokenKind {
  if (/^\/\*/.test(value)) return 'comment';
  if (/^['"]/.test(value)) return 'string';
  if (/^\$/.test(value)) return 'variable';
  if (/^@/.test(value)) return 'keyword';
  if (/^#[\da-f]{3,8}$/i.test(value)) return 'literal';
  if (/^-?(\d*\.)?\d/.test(value)) return 'number';
  if (/^[.#]|^&$/.test(value)) return 'selector';
  if (/^--|^[A-Za-z-]+$/.test(value)) return 'property';
  return 'operator';
}

export function tokenizeCode(code: string, language = 'text'): CodeToken[] {
  const tokens: CodeToken[] = [];
  const isStyle = /^(css|scss|sass|less)$/i.test(language);
  const pattern = isStyle ? STYLE_TOKEN_PATTERN : SCRIPT_TOKEN_PATTERN;
  let cursor = 0;
  pattern.lastIndex = 0;
  let match = pattern.exec(code);
  while (match) {
    if (match.index > cursor) tokens.push({ kind: 'text', value: code.slice(cursor, match.index) });
    tokens.push({ kind: isStyle ? getStyleTokenKind(match[0]) : getTokenKind(match[0]), value: match[0] });
    cursor = pattern.lastIndex;
    match = pattern.exec(code);
  }
  if (cursor < code.length) tokens.push({ kind: 'text', value: code.slice(cursor) });
  return tokens;
}

export default function CodeBlock({
  code,
  language = 'text',
  className = '',
  showLanguage = true,
}: CodeBlockProps): React.ReactElement {
  const classes = ['code-block', className].filter(Boolean).join(' ');
  return (
    <pre className={classes} data-language={showLanguage ? language : undefined}>
      <code>
        {tokenizeCode(code, language).map((token, index) => (
          <span className={`code-token-${token.kind}`} key={`${index}-${token.kind}`}>{token.value}</span>
        ))}
      </code>
    </pre>
  );
}
