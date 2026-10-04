import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { createTranslator } from '../demo_react_shared/src/workspace/i18n';
import CodeEditor from '../demo_react_shared/src/workspace/components/CodeEditor';
import CodeWorkspace from '../demo_react_shared/src/workspace/components/CodeWorkspace';
import ExampleIntro from '../demo_react_shared/src/workspace/components/ExampleIntro';
import MarkdownDocument, { parseMarkdown } from '../demo_react_shared/src/workspace/components/MarkdownDocument';
import type { SiteRouteEntry } from '../demo_react_shared/src/workspace/navigation';

describe('CodeEditor', () => {
  it('keeps union types and escaped pipes inside one Markdown table cell', () => {
    const blocks = parseMarkdown([
      '| Option | Type |',
      '|---|---|',
      '| `mode` | `boolean | HistoryType` |',
      '| `fallback` | `preserve` \\| `throw` |',
    ].join('\n'));
    const table = blocks[0] as Extract<typeof blocks[number], { type: 'table' }>;

    expect(table.rows).toEqual([
      ['Option', 'Type'],
      ['`mode`', '`boolean | HistoryType`'],
      ['`fallback`', '`preserve` | `throw`'],
    ]);

    const view = render(<MarkdownDocument
      source={'## RouterView\n\n| API | Type |\n|---|---|\n| mode | `browser | memory` |'} tableOfContentsLabel="Contents"
    />);
    expect(view.container.querySelectorAll('tbody td')).toHaveLength(2);
  });

  it('renders syntax tokens and keeps the editable source in sync', () => {
    const onChange = jest.fn();
    const view = render(
      <CodeEditor
        label="src/App.tsx"
        language="tsx"
        onChange={onChange}
        value="const title = 'Router';"
      />,
    );

    expect(view.container.querySelector('.code-token-keyword')?.textContent).toBe('const');
    expect(view.container.querySelector('.code-token-string')?.textContent).toBe("'Router'");
    expect(view.container.querySelector('textarea')?.getAttribute('aria-label')).toBe('src/App.tsx');

    fireEvent.change(view.container.querySelector('textarea') as HTMLTextAreaElement, {
      target: { value: 'export default title;' },
    });
    expect(onChange).toHaveBeenCalledWith('export default title;');
  });

  it('highlights SCSS structure instead of treating it as plain script text', () => {
    const view = render(
      <CodeEditor
        label="src/styles.scss"
        language="scss"
        onChange={jest.fn()}
        value={'$brand: #42c929;\n.card { color: $brand; &:hover { opacity: .8; } }'}
      />,
    );

    expect(view.container.querySelector('.code-token-variable')?.textContent).toBe('$brand');
    expect(view.container.querySelector('.code-token-selector')?.textContent).toBe('.card');
    expect(view.container.querySelector('.code-token-property')?.textContent).toBe('color');
    expect(view.container.querySelector('.code-token-literal')?.textContent).toBe('#42c929');
  });

  it('uses one file-tree workspace for editable and read-only source views', () => {
    const view = render(
      <CodeWorkspace
        entry="App.tsx"
        files={[
          {
            path: 'App.tsx',
            content: "const text = t('drawerWidth');",
            translations: [{ start: 13, end: 29, value: { kind: 'text', key: 'drawerWidth' } }]
          },
          { path: 'styles/App.scss', content: '.app { color: #42c929; }' },
        ]}
      />,
    );

    expect(view.container.querySelector('textarea')).toBeNull();
    fireEvent.click(view.getByRole('button', { name: 'App.scss' }));
    expect(view.container.querySelector('.code-block')?.getAttribute('data-language')).toBe('scss');
    expect(view.container.querySelector('.code-token-selector')?.textContent).toBe('.app');
  });

  it('opens the real multi-file example manifest in a read-only workspace', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        'demo_react_shared/src/examples/example': {
          entry: 'App.tsx',
          files: [
            {
              path: 'App.tsx',
              content: "const text = t('drawerWidth');",
              translations: [{ start: 13, end: 29, value: { kind: 'text', key: 'drawerWidth' } }]
            },
            { path: 'App.scss', content: '.app { color: #42c929; }' },
          ],
        },
      }),
    });
    Object.defineProperty(global, 'fetch', { configurable: true, value: fetchMock });
    const entry = {
      path: '/examples/example',
      title: 'exampleTitle',
      navigation: { section: 'examples', order: 1 },
      example: {
        description: 'exampleDescription',
        scenarios: ['exampleScenario'],
        apis: ['RouterView'],
        source: 'demo_react_shared/src/examples/example',
      },
      route: {},
    } as SiteRouteEntry;
    const view = render(<ExampleIntro entry={entry} t={(key) => key} />);

    fireEvent.click(view.getByRole('button', { name: 'viewSource' }));
    await waitFor(() => expect(view.getByRole('dialog', { name: 'sourceFiles' })).toBeTruthy());
    await waitFor(() => expect(view.getByRole('button', { name: 'App.scss' })).toBeTruthy());
    expect(view.container.querySelector('textarea')).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('playground/examples.json'));
    view.rerender(<ExampleIntro entry={entry} t={createTranslator('zh')} />);
    expect(view.container.querySelector('.code-block')?.textContent).toContain('宽度');
    expect(view.container.querySelector('.code-block')?.textContent).not.toContain("t('drawerWidth')");
    view.rerender(<ExampleIntro entry={entry} t={createTranslator('en')} />);
    expect(view.container.querySelector('.code-block')?.textContent).toContain('Width');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const onDebug = jest.fn();
    view.rerender(<ExampleIntro entry={entry} t={createTranslator('en')} onDebug={onDebug} />);
    fireEvent.click(view.getByRole('button', { name: 'Debug', exact: true }));
    expect(onDebug).toHaveBeenCalledWith('example');
    expect(view.queryByRole('dialog')).toBeNull();
    Reflect.deleteProperty(global, 'fetch');
  });
});
