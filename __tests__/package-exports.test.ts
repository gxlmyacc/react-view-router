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

  it('defaults all public modules to legacy artifacts and exposes explicit modern entries', () => {
    PUBLIC_JS_SUBPATHS.forEach((subpath) => {
      const entry = exportsMap[subpath] as ConditionalExport;

      expect(Object.keys(entry)).toEqual(['types', 'import', 'require', 'default']);
      expect(entry.default).toBe(entry.require);
      expect(entry.import).toBe(entry.require);
      const modern = exportsMap[subpath === '.' ? './es' : `./es/${subpath.slice(2)}`] as ConditionalExport;
      expect(modern.import).toContain('/es/');
      expect(modern.types).toBe(entry.types);
      expect(fs.existsSync(path.resolve(modern.import))).toBe(true);
      Object.values(entry).forEach((target) => {
        expect(target.startsWith('./')).toBe(true);
        expect(fs.existsSync(path.resolve(target))).toBe(true);
      });
    });
  });

  it('keeps styles internal to their component entries', () => {
    expect(Object.keys(exportsMap).some((key) => key.endsWith('.css'))).toBe(false);
    for (const moduleName of ['drawer', 'transition']) {
      const childPackage = JSON.parse(fs.readFileSync(moduleName + '/package.json', 'utf8'));
      expect(Object.keys(childPackage.exports).some((key) => key.endsWith('.css'))).toBe(false);
    }
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
        import: './esm/index.js',
        require: './esm/index.js',
        default: './esm/index.js',
      });
    });
  });
});
