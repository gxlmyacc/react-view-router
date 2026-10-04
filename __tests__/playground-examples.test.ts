import fs from 'fs';
import path from 'path';
import vm from 'vm';
import React from 'react';
import ts from 'typescript';
import { createExampleWorkspace } from '../demo_react_shared/src/playground/example-workspace';

const { collectExampleSources } = require('../scripts/prepare-playground-assets');

describe('example Playground workspaces', () => {
  const manifest = collectExampleSources(path.resolve('demo_react_shared/src/examples'));
  it('imports complete localized files and dependencies, and preserves the source manifest', () => {
    const source = manifest['demo_react_shared/src/examples/drawer'];
    const workspace = createExampleWorkspace('drawer', source, 'zh');
    expect(workspace.files.map((file) => file.path)).toContain('workspace/context.tsx');
    const home = workspace.files.find((file) => file.path === 'examples/drawer/HomePage.tsx')!;
    expect(home.content).toContain('最大宽度');
    expect(home.content).not.toMatch(/\bt\s*\(/);
    const english = createExampleWorkspace('drawer', source, 'en');
    const englishHome = english.files.find((file) => file.path === home.path)!;
    expect(englishHome.content).toContain('Max width');
    expect(englishHome.content).not.toMatch(/\bt\s*\(/);
    expect(source.files.find((file: any) => file.path === 'HomePage.tsx').content).toMatch(/\bt\s*\(/);
    const entry = workspace.files.find((file) => file.path === workspace.entry)!;
    expect(entry.content).toContain('HistoryType.memory');
    expect(entry.content).toContain('locale="zh"');
    expect(new Set(workspace.files.map((file) => file.path)).size).toBe(workspace.files.length);
  });

  it('compiles all example files including scoped styles, media queries, and extension imports', () => {
    let compile: ((event: {data: unknown}) => void) | undefined;
    let response: { diagnostics: string[]; code: string; css: string } | undefined;
    const context = vm.createContext({
      ts,
      importScripts: jest.fn(),
      self: {
        addEventListener: (_name: string, callback: typeof compile) => { compile = callback; },
        postMessage: (value: typeof response) => { response = value; },
      }
    });
    vm.runInContext(fs.readFileSync('scripts/playground/compiler-worker.js', 'utf8'), context);
    Object.entries(manifest).forEach(([id, source]) => {
      const workspace = createExampleWorkspace(id.split('/').pop()!, source as any, 'en');
      compile!({ data: { type: 'react-viewplayground-compile', id: 1, ...workspace } });
      expect(response!.diagnostics).toEqual([]);
      expect(response!.css).not.toContain(':scope');
      // Parse the worker output exactly as the sandbox does.
      // eslint-disable-next-line no-new-func
      expect(() => new Function('React', 'ReactViewRouterLib', 'PlaygroundModules', response!.code)).not.toThrow();
    });
    // The compiler can resolve injected packages and style import queries without loading external code.
    compile!({
      data: {
        type: 'react-viewplayground-compile',
        entry: 'App.tsx',
        files: [
          { path: 'App.tsx', content: "import Drawer from 'react-view-router/drawer'; import './App.scss?scoped'; export default Drawer;" },
          { path: 'App.scss', content: '.app { &:scope { p { color: green; } } @media (max-width: 500px) { color: red; } }' },
        ]
      }
    });
    expect(response!.diagnostics).toEqual([]);
    expect(response!.css).toContain('@media (max-width: 500px)');
    // eslint-disable-next-line no-new-func
    const factory = new Function('React', 'ReactViewRouterLib', 'PlaygroundModules', response!.code);
    const Drawer = () => React.createElement('div');
    expect(factory(React, {}, { 'react-view-router/drawer': { __esModule: true, default: Drawer } })).toBe(Drawer);
  });
});
