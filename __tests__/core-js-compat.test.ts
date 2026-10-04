/** @jest-environment node */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const babel = require('@babel/core');

describe('core-js 3 compatibility', () => {
  it('keeps the package, both production builds and the legacy fixture on core-js 3', () => {
    const root = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const fixture = JSON.parse(fs.readFileSync('fixtures/chrome49-legacy/package.json', 'utf8'));
    const config = require('../babel.config')({ env: () => false });
    const previousBuildEnv = process.env.BUILD_ENV;
    try {
      process.env.BUILD_ENV = 'es';
      const esConfig = require('../babel.config')({ env: () => false });
      [config, esConfig].forEach((buildConfig) => {
        expect(buildConfig.presets[0][1].corejs).toBe('3.50');
        expect(buildConfig.presets[0][1].useBuiltIns).toBe('usage');
      });
    } finally {
      if (previousBuildEnv === undefined) delete process.env.BUILD_ENV;
      else process.env.BUILD_ENV = previousBuildEnv;
    }
    expect(root.dependencies['core-js']).toBe('^3.50.0');
    expect(fixture.dependencies['core-js']).toBe(root.dependencies['core-js']);
    expect(require('../fixtures/chrome49-legacy/webpack.config').module.rules[0]
      .use.options.presets[0][1].corejs).toBe('3.50');
    ['demo_react16', 'demo_react17', 'demo_react18', 'demo_react19'].forEach((demo) => {
      const manifest = JSON.parse(fs.readFileSync(`${demo}/package.json`, 'utf8'));
      expect(manifest.dependencies[root.name]).toBe('link:..');
    });
  });

  it('injects resolvable polyfills that restore missing modern APIs on the legacy path', () => {
    const config = require('../babel.config')({ env: () => false });
    const source = `
      Promise.allSettled([Promise.resolve(7), Promise.reject('expected')]).then(results => {
        console.log(JSON.stringify({
          object: Object.fromEntries([['value', 7]]),
          flat: [1, [2]].flat(),
          statuses: results.map(result => result.status)
        }));
      });
    `;
    const code = babel.transformSync(source, {
      ...config,
      filename: path.resolve('core-js-compat.ts'),
      configFile: false,
      babelrc: false,
    }).code;
    expect(code).toContain('core-js/modules/es.object.from-entries.js');
    expect(code).toContain('core-js/modules/es.promise.all-settled.js');
    expect(code).toContain('core-js/modules/es.array.flat.js');
    expect(code).not.toMatch(/core-js\/modules\/es[67]\./);
    const result = spawnSync(process.execPath, ['-e', `
      delete Object.fromEntries;
      delete Array.prototype.flat;
      delete Promise.allSettled;
      ${code}
    `], { cwd: path.resolve('.'), encoding: 'utf8' });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      object: { value: 7 }, flat: [1, 2], statuses: ['fulfilled', 'rejected'],
    });
  });
});
