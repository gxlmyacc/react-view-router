import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const CORE_RUNTIME_FILES = [
  'navigation-signal.ts',
  'route-lazy-renderer.ts',
  'route-runtime.ts',
  'route-runtime-navigation.ts',
  'route-runtime-context.ts',
  'standalone-route-ssr-adapter.ts',
];

const FORBIDDEN_CORE_GLOBALS = new Set([
  'AbortController',
  'AbortSignal',
  'DOMException',
  'Proxy',
  'ReadableStream',
  'queueMicrotask',
  'structuredClone',
]);

function readSource(file: string) {
  return fs.readFileSync(path.resolve('src', file), 'utf8');
}

function collectIdentifiers(file: string) {
  const source = ts.createSourceFile(file, readSource(file), ts.ScriptTarget.ESNext, true);
  const identifiers = new Set<string>();
  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) identifiers.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return identifiers;
}

describe('runtime package boundaries', () => {
  it('core runtime files must not import ReactDOM version-specific entrypoints', () => {
    CORE_RUNTIME_FILES.forEach((file) => {
      const source = ts.createSourceFile(file, readSource(file), ts.ScriptTarget.ESNext, true);
      const modules = source.statements
        .filter(ts.isImportDeclaration)
        .map((statement) => (statement.moduleSpecifier as ts.StringLiteral).text);

      expect(modules).not.toContain('react-dom');
      expect(modules).not.toContain('react-dom/client');
    });
  });

  it('core runtime must not require unshimmable modern platform globals', () => {
    CORE_RUNTIME_FILES.forEach((file) => {
      const identifiers = collectIdentifiers(file);
      FORBIDDEN_CORE_GLOBALS.forEach((globalName) => {
        expect(identifiers.has(globalName)).toBe(false);
      });
    });
  });

  it('published subpath metadata must keep modern and legacy entrypoints separate', () => {
    const root = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const drawer = JSON.parse(fs.readFileSync('drawer/package.json', 'utf8'));
    const dom = JSON.parse(fs.readFileSync('dom/package.json', 'utf8'));
    const transition = JSON.parse(fs.readFileSync('transition/package.json', 'utf8'));
    const modern = JSON.parse(fs.readFileSync('standalone-modern/package.json', 'utf8'));
    const legacy = JSON.parse(fs.readFileSync('standalone-legacy/package.json', 'utf8'));

    expect(root.main).toBe('esm/index.js');
    expect(root.module).toBe('es/index.js');
    expect(drawer.module).toBe('es/index.js');
    expect(dom.module).toBe('es/index.js');
    expect(transition.module).toBe('es/index.js');
    expect(modern.main).toBe('../esm/standalone-modern.js');
    expect(modern.types).toBe('../types/standalone-modern.d.ts');
    expect(legacy.main).toBe('../esm/standalone-legacy.js');
    expect(legacy.types).toBe('../types/standalone-legacy.d.ts');
  });
});
