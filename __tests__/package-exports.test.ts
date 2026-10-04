/** @jest-environment node */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

type ConditionalExport = {
  types: string;
  import: string;
  require: string;
  default: string;
};

const PUBLIC_JS_SUBPATHS = [
  '.',
  './dom',
  './drawer',
  './transition',
  './standalone-modern',
  './standalone-legacy',
];

describe('package exports', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const exportsMap = packageJson.exports as Record<string, ConditionalExport | string>;

  it('maps every public JavaScript module to types, ESM, and CommonJS artifacts', () => {
    PUBLIC_JS_SUBPATHS.forEach((subpath) => {
      const entry = exportsMap[subpath] as ConditionalExport;

      expect(Object.keys(entry)).toEqual(['types', 'import', 'require', 'default']);
      expect(entry.default).toBe(entry.require);
      Object.values(entry).forEach((target) => {
        expect(target.startsWith('./')).toBe(true);
        expect(fs.existsSync(path.resolve(target))).toBe(true);
      });
    });
  });

  it('preserves public style and package metadata subpaths without exposing internals', () => {
    expect(exportsMap['./drawer/index.css']).toEqual(expect.objectContaining({
      import: './drawer/es/index.css',
      require: './drawer/esm/index.css',
    }));
    expect(exportsMap['./drawer/style/drawer.css']).toBeUndefined();
    expect(exportsMap['./transition/router-view.css']).toEqual(expect.objectContaining({
      import: './transition/es/router-view.css',
      require: './transition/esm/router-view.css',
    }));
    expect(exportsMap['./package.json']).toBe('./package.json');
    expect(exportsMap['./next-app']).toBeUndefined();
    expect(exportsMap['./next-pages']).toBeUndefined();
    expect(exportsMap['./next-plugin']).toBeUndefined();
    expect(exportsMap['./*']).toBeUndefined();
  });

  it('resolves CommonJS self-references through the declared require conditions', () => {
    PUBLIC_JS_SUBPATHS.forEach((subpath) => {
      const request = subpath === '.' ? 'react-view-router' : `react-view-router/${subpath.slice(2)}`;
      const entry = exportsMap[subpath] as ConditionalExport;
      const resolved = execFileSync(
        process.execPath,
        ['-p', `require.resolve(${JSON.stringify(request)})`],
        { cwd: process.cwd(), encoding: 'utf8' },
      ).trim();
      expect(path.normalize(resolved)).toBe(path.resolve(entry.require));
    });
  });

  it('keeps independently published legacy modules export-aware', () => {
    ['dom', 'drawer', 'transition'].forEach((moduleName) => {
      const childPackage = JSON.parse(fs.readFileSync(`${moduleName}/package.json`, 'utf8'));
      expect(childPackage.exports['.']).toEqual({
        types: './types/index.d.ts',
        import: './es/index.js',
        require: './esm/index.js',
        default: './esm/index.js',
      });
    });
  });
});
