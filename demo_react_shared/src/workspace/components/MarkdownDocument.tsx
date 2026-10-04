import React, { useEffect, useMemo, useRef, useState } from 'react';
import CodeBlock from './CodeBlock';
import './MarkdownDocument.scss';

type MarkdownBlock =
  | { type: 'code'; language: string; content: string }
  | { type: 'heading'; level: number; content: string; id: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'paragraph'|'quote'; content: string }
  | { type: 'table'; rows: string[][] };

export interface MarkdownDocumentProps {
  source: string;
  tableOfContentsLabel: string;
  onLinkClick?: (href: string) => boolean;
}

function slugify(value: string): string {
  return value
    .replace(/[`*_()[\]]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u3400-\u9fff-]/g, '');
}

function splitTableRow(line: string): string[] {
  const source = line.trim().replace(/^\||\|$/g, '');
  const cells: string[] = [];
  let cell = '';
  let inCode = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === '\\' && nextCharacter === '|') {
      cell += '|';
      index += 1;
    } else if (character === '`') {
      inCode = !inCode;
      cell += character;
    } else if (character === '|' && !inCode) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function startsBlock(lines: string[], index: number): boolean {
  const line = lines[index] || '';
  const next = lines[index + 1] || '';
  return /^#{1,6}\s/.test(line)
    || /^```/.test(line)
    || /^\s*(?:[-*+] |\d+\. )/.test(line)
    || /^>\s?/.test(line)
    || (line.indexOf('|') >= 0 && /^\s*\|?\s*:?-{3,}/.test(next));
}

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  const slugs: Record<string, number> = {};
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    const fence = line.match(/^```([^\s]*)/);
    if (fence) {
      const content: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        content.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: 'code', language: fence[1] || 'text', content: content.join('\n') });
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const base = slugify(heading[2]) || 'section';
      const count = slugs[base] || 0;
      slugs[base] = count + 1;
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        content: heading[2],
        id: count ? `${base}-${count + 1}` : base,
      });
      index += 1;
      continue;
    }

    if (line.indexOf('|') >= 0 && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || '')) {
      const rows = [splitTableRow(line)];
      index += 2;
      while (index < lines.length && lines[index].indexOf('|') >= 0 && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }

    const listItem = line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);
    if (listItem) {
      const ordered = Boolean(listItem[2]);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);
        if (!item || Boolean(item[2]) !== ordered) break;
        items.push(item[3]);
        index += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    if (/^>\s?/.test(line)) {
      const content: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        content.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({ type: 'quote', content: content.join(' ') });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !startsBlock(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', content: paragraph.join(' ') });
  }
  return blocks;
}

function renderInline(value: string): React.ReactNode[] {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|!?\[[^\]]+\]\([^)]+\))/g;
  const result: React.ReactNode[] = [];
  let cursor = 0;
  let match = pattern.exec(value);
  while (match) {
    if (match.index > cursor) result.push(value.slice(cursor, match.index));
    const token = match[0];
    if (token[0] === '`') {
      result.push(<code key={`${match.index}-code`}>{token.slice(1, -1)}</code>);
    } else if (token.indexOf('**') === 0) {
      result.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
    } else {
      const link = token.match(/^(!?)\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && link[1]) {
        result.push(<span className="markdown-image-link" key={`${match.index}-image`}>{link[2]}</span>);
      } else if (link) {
        result.push(<a href={link[3]} key={`${match.index}-link`}>{link[2]}</a>);
      }
    }
    cursor = pattern.lastIndex;
    match = pattern.exec(value);
  }
  if (cursor < value.length) result.push(value.slice(cursor));
  return result;
}

export default function MarkdownDocument({
  source,
  tableOfContentsLabel,
  onLinkClick,
}: MarkdownDocumentProps): React.ReactElement {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  const headings = useMemo(() => blocks.filter((block): block is Extract<MarkdownBlock, { type: 'heading' }> => (
    block.type === 'heading' && block.level >= 2 && block.level <= 3
  )), [blocks]);
  const layoutRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const [activeHeadingId, setActiveHeadingId] = useState(headings[0]?.id || '');

  useEffect(() => {
    const layout = layoutRef.current;
    const scrollContainer = layout && layout.closest('.api-document-page');
    if (!layout || !scrollContainer || !headings.length) return undefined;
    let frame = 0;

    const updateActiveHeading = () => {
      frame = 0;
      const containerTop = scrollContainer.getBoundingClientRect().top;
      let activeId = headings[0].id;
      headings.forEach(heading => {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= containerTop + 28) activeId = heading.id;
      });
      setActiveHeadingId(activeId);

      const toc = tocRef.current;
      const activeLink = toc && Array.prototype.find.call(
        toc.querySelectorAll<HTMLAnchorElement>('[data-heading-id]'),
        (link: HTMLAnchorElement) => link.getAttribute('data-heading-id') === activeId,
      ) as HTMLAnchorElement|undefined;
      if (toc && activeLink) {
        const linkTop = activeLink.offsetTop;
        const linkBottom = linkTop + activeLink.offsetHeight;
        if (linkTop < toc.scrollTop) toc.scrollTop = linkTop;
        else if (linkBottom > toc.scrollTop + toc.clientHeight) toc.scrollTop = linkBottom - toc.clientHeight;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveHeading);
    };

    updateActiveHeading();
    scrollContainer.addEventListener('scroll', onScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [headings]);
  const renderBlock = (block: MarkdownBlock, index: number): React.ReactNode => {
    if (block.type === 'heading') {
      return React.createElement(
        `h${block.level}`,
        { id: block.id, key: `${block.id}-${index}` },
        renderInline(block.content),
      );
    }
    if (block.type === 'code') {
      return <CodeBlock code={block.content} language={block.language} key={`code-${index}`} />;
    }
    if (block.type === 'table') {
      const [header, ...rows] = block.rows;
      return (
        <div className="markdown-table-wrap" key={`table-${index}`}>
          <table>
            <thead><tr>{header.map((cell, cellIndex) => <th key={cellIndex}>{renderInline(cell)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{renderInline(cell)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      );
    }
    if (block.type === 'list') {
      const List = block.ordered ? 'ol' : 'ul';
      return <List key={`list-${index}`}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</List>;
    }
    if (block.type === 'quote') return <blockquote key={`quote-${index}`}>{renderInline(block.content)}</blockquote>;
    return <p key={`paragraph-${index}`}>{renderInline(block.content)}</p>;
  };

  const sections: Array<{ key: string; blocks: Array<{ block: MarkdownBlock; index: number }> }> = [];
  blocks.forEach((block, index) => {
    if (!sections.length || (block.type === 'heading' && block.level === 2)) {
      sections.push({
        key: block.type === 'heading' ? block.id : `preamble-${index}`,
        blocks: [],
      });
    }
    sections[sections.length - 1].blocks.push({ block, index });
  });

  return (
    <div
      className="markdown-document-layout"
      ref={layoutRef}
      onClick={event => {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');
        if (anchor && onLinkClick && onLinkClick(anchor.getAttribute('href') || '')) event.preventDefault();
      }}
    >
      <aside className="markdown-toc" ref={tocRef}>
        <strong>{tableOfContentsLabel}</strong>
        {headings.map(heading => (
          <a
            className={`is-level-${heading.level}${activeHeadingId === heading.id ? ' is-active' : ''}`}
            data-heading-id={heading.id}
            href={`#${heading.id}`}
            key={heading.id}
            onClick={event => {
              event.preventDefault();
              setActiveHeadingId(heading.id);
              document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {heading.content.replace(/[`*]/g, '')}
          </a>
        ))}
      </aside>
      <article className="markdown-document">
        {sections.map((section, sectionIndex) => (
          <section
            className={sectionIndex === 0 ? 'markdown-preamble' : 'markdown-section'}
            key={section.key}
          >
            {section.blocks.map(item => renderBlock(item.block, item.index))}
          </section>
        ))}
      </article>
    </div>
  );
}
