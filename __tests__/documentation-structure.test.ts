/** @jest-environment node */

import fs from 'fs';
import path from 'path';
import { collectReferenceDocuments } from '../scripts/prepare-playground-assets';

function read(file: string) {
  return fs.readFileSync(path.resolve(file), 'utf8');
}

describe('documentation structure', () => {
  it('bundles local API guide links and their Chinese counterparts for the site', () => {
    const documents = collectReferenceDocuments(path.resolve('.'));
    expect(documents['docs/api.md'].en).toContain('# ReactViewRouter API');
    expect(documents['docs/api.md'].zh).toContain('# ReactViewRouter API');
    expect(documents['docs/ssr.md'].en).toContain('SSR');
    expect(documents['docs/ssr.md'].zh).toContain('SSR');
    expect(documents['demo_ssr/server/renderDocument.jsx'].en).toContain('renderDocument');
  });
  it('keeps the root README concise and publishes complete API references', () => {
    const readmeLines = read('README.md').split(/\r?\n/).length;
    const chineseReadmeLines = read('README_CN.md').split(/\r?\n/).length;
    const apiLines = read('docs/api.md').split(/\r?\n/).length;
    const chineseApiLines = read('docs/api_CN.md').split(/\r?\n/).length;

    expect(readmeLines).toBeLessThan(150);
    expect(chineseReadmeLines).toBeLessThan(150);
    expect(apiLines).toBeGreaterThan(350);
    expect(chineseApiLines).toBeGreaterThan(350);
    expect(read('README.md')).toContain('https://github.com/gxlmyacc/react-view-router/blob/master/docs/api.md');
  });

  it('documents every primary public API in both languages', () => {
    const documents = [read('docs/api.md'), read('docs/api_CN.md')];
    const publicApis = [
      'ReactViewRouter', 'RouterView', 'RouterLink', 'lazyImport',
      'withRouter', 'withRoute', 'withMatchedRoute', 'withRouterView', 'withRouteGuards',
      'useRouter', 'useManualRouter', 'useRoute', 'useMatchedRoute',
      'useMatchedRouteIndex', 'useMatchedRouteAndIndex', 'useRouterView',
      'useRouteMeta', 'useRouteState', 'useRouteParams', 'useRouteQuery',
      'useRouteChanged', 'useRouteMetaChanged', 'useRouteGuardsRef',
      'useRouterViewEvent', 'useViewActivate', 'useViewDeactivate', 'useRouteTitle',
      'ReactViewRoutePlugin', 'createHistory4', 'collectHydratableRoutes',
      'matchHydratableRoutes', 'resolveHydratableRoutes',
    ];

    documents.forEach((document) => {
      publicApis.forEach((api) => expect(document).toContain(api));
      expect(document).not.toContain('RainbwoRouter');
      expect(document).not.toContain('RainbowRoutePlugin');
      expect(document).not.toContain('router.vuejs');
    });
  });

  it('provides linked English and Chinese versions of every docs guide', () => {
    const documentPairs = [
      ['docs/api.md', 'docs/api_CN.md'],
      ['docs/ssr.md', 'docs/ssr_CN.md'],
      ['docs/server-components.md', 'docs/server-components_CN.md'],
      ['docs/ssr-route-island-design.md', 'docs/ssr-route-island-design_CN.md'],
      ['docs/guard-plugin-design.md', 'docs/guard-plugin-design_CN.md'],
    ];

    documentPairs.forEach(([englishPath, chinesePath]) => {
      expect(fs.existsSync(englishPath)).toBe(true);
      expect(fs.existsSync(chinesePath)).toBe(true);
      expect(read(englishPath)).toContain(`[简体中文](./${path.basename(chinesePath)})`);
      expect(read(chinesePath)).toContain(`[English](./${path.basename(englishPath)})`);
    });
  });

  it('provides linked English and Chinese README files for the project and every demo', () => {
    const directories = [
      '.',
      'demo_react16',
      'demo_react17',
      'demo_react18',
      'demo_react19',
      'demo_react_shared',
      'demo_ssr',
      'demo_native',
    ];

    directories.forEach((directory) => {
      const englishPath = path.join(directory, 'README.md');
      const chinesePath = path.join(directory, 'README_CN.md');

      expect(fs.existsSync(englishPath)).toBe(true);
      expect(fs.existsSync(chinesePath)).toBe(true);
      const readmeBase = directory === '.'
        ? 'https://github.com/gxlmyacc/react-view-router/blob/master/'
        : './';
      expect(read(englishPath)).toContain(`[简体中文](${readmeBase}README_CN.md)`);
      expect(read(chinesePath)).toContain(`[English](${readmeBase}README.md)`);
    });
  });

  it('publishes every document and image referenced by the split API guide', () => {
    const packageFiles = JSON.parse(read('package.json')).files;

    expect(packageFiles).toEqual(expect.arrayContaining([
      'docs',
      'images',
    ]));
    expect(fs.existsSync('docs/ssr.md')).toBe(true);
    expect(fs.existsSync('docs/ssr_CN.md')).toBe(true);
    expect(fs.existsSync('docs/server-components.md')).toBe(true);
    expect(fs.existsSync('docs/server-components_CN.md')).toBe(true);
    expect(fs.existsSync('docs/integrations/next-pages.md')).toBe(false);
    expect(fs.existsSync('docs/integrations/next-app.md')).toBe(false);
    expect(fs.existsSync('images/1.png')).toBe(true);
    expect(fs.existsSync('images/route.png')).toBe(true);
  });

  it('does not publish framework-specific routing integration documentation', () => {
    const readme = read('README.md');
    expect(readme).not.toContain('react-view-router/next-app');
    expect(readme).not.toContain('react-view-router/next-pages');
    expect(readme).not.toContain('react-view-router/next-plugin');
  });

  it('uses JSX in user-facing SSR and Native examples', () => {
    const exampleFiles = [
      'demo_ssr/src/App.jsx',
      'demo_ssr/server/renderDocument.jsx',
      'demo_native/src/App.jsx',
      'demo_native/src/screens/HomeScreen.jsx',
      'fixtures/chrome49-legacy/src/index.jsx',
    ];

    exampleFiles.forEach((file) => {
      expect(read(file)).toMatch(/<[A-Z]|<main|<html|<View/);
      expect(read(file)).not.toContain('React.createElement');
    });
  });
});
