import fs from 'fs';
import vm from 'vm';
import React from 'react';
import ts from 'typescript';

interface WorkerResponse {
  code: string;
  css: string;
  diagnostics: string[];
}

describe('playground compiler worker', () => {
  it('bundles virtual modules and flattens common SCSS nesting', () => {
    const source = fs.readFileSync('scripts/playground/compiler-worker.js', 'utf8');
    let compile: ((event: { data: unknown }) => void) | undefined;
    let response: WorkerResponse | undefined;
    const context = vm.createContext({
      console,
      ts,
      importScripts: jest.fn(),
      self: {
        addEventListener: (_name: string, callback: typeof compile) => { compile = callback; },
        postMessage: (message: WorkerResponse) => { response = message; },
      },
    });
    vm.runInContext(source, context);

    compile?.({
      data: {
        type: 'react-viewplayground-compile',
        id: 1,
        entry: 'src/App.tsx',
        files: [
          {
            path: 'src/App.tsx',
            content: "import React from 'react'; import value from './value'; export default function App() { return <b>{value}</b>; }",
          },
          { path: 'src/value.ts', content: "export default 'ready';" },
          {
            path: 'src/styles.scss',
            content: '$color: green; .app { color: $color; &:hover { color: blue; } }',
          },
        ],
      },
    });

    expect(response?.diagnostics).toEqual([]);
    expect(response?.css).toContain('.app { color: green; }');
    expect(response?.css).toContain('.app:hover { color: blue; }');
    const App = new Function('React', 'ReactViewRouterLib', response?.code || '')(React, {});
    expect(App().props.children).toBe('ready');
  });
});
