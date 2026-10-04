/** @jest-environment node */

import fs from 'fs';
import getPathnameFromDeepLink from '../demo_native/src/navigation/getPathnameFromDeepLink';
import { collectHydratableRoutes } from '../src/route-hydration-server';

const renderDocument = require('../demo_ssr/server/renderDocument').default;
const { routes } = require('../demo_ssr/src/router/routes');

describe('demo best-practice contracts', () => {
  it('keeps the standalone SSR client setup free of redundant factories and selectors', () => {
    const routesSource = fs.readFileSync('demo_ssr/src/router/routes.js', 'utf8');
    const routerSource = fs.readFileSync('demo_ssr/src/router/index.js', 'utf8');
    const clientSource = fs.readFileSync('demo_ssr/src/client/index.jsx', 'utf8');

    expect(routesSource).toContain('{ hydrate: true }');
    expect(routesSource).not.toContain('container:');
    expect(routerSource).toContain('new ReactViewRouter');
    expect(clientSource).toContain('createModernStandaloneRouteSSRAdapter({ document })');
    expect(fs.existsSync('demo_ssr/src/router/createAppRouter.js')).toBe(false);
    expect(fs.existsSync('demo_ssr/src/runtime/createRouteRuntimeAdapter.js')).toBe(false);
  });

  it('SSR server/client manifest should match the core route identity algorithm', async () => {
    const manifest = collectHydratableRoutes(routes);
    const ssrDescriptor = manifest.find((item) => item.route.path === '/ssr')!.descriptor;
    const reportsDescriptor = manifest.find((item) => item.route.path === '/reports')!.descriptor;
    const workspaceDescriptor = manifest.find((item) => item.route.path === '/workspace')!.descriptor;
    const auditDescriptor = manifest.find((item) => item.route.path === '/workspace/overview/audit')!.descriptor;
    const ssrDocument = await renderDocument('/ssr');
    const reportsDocument = await renderDocument('/reports?period=month');
    const clientDocument = await renderDocument('/client');
    const nestedClientDocument = await renderDocument('/workspace/overview/tools');
    const nestedSSRDocument = await renderDocument('/workspace/overview/audit');

    expect(ssrDocument).toContain(`data-react-viewroute-id="${ssrDescriptor.routeId}"`);
    expect(ssrDocument).toContain('data-react-viewprotocol-version="1"');
    expect(reportsDocument).toContain(`data-react-viewroute-id="${reportsDescriptor.routeId}"`);
    expect(clientDocument).not.toContain('data-react-viewssr-route="true"');
    expect(nestedClientDocument).toContain(`data-react-viewroute-id="${workspaceDescriptor.routeId}"`);
    expect(nestedClientDocument).not.toContain(`data-react-viewroute-id="${auditDescriptor.routeId}"`);
    expect(nestedSSRDocument).toContain(`data-react-viewroute-id="${workspaceDescriptor.routeId}"`);
    expect(nestedSSRDocument).toContain(`data-react-viewroute-id="${auditDescriptor.routeId}"`);
    expect((nestedSSRDocument.match(/data-react-viewssr-route="true"/g) || [])).toHaveLength(2);
  });

  it('Native deep-link mapping should use application-owned prefixes', () => {
    const prefixes = ['react-view-router://', 'https://example.com/react-view-router/'];

    expect(getPathnameFromDeepLink('react-view-router://details?tab=1', prefixes)).toBe('/details');
    expect(getPathnameFromDeepLink(
      'https://example.com/react-view-router/portable',
      prefixes,
    )).toBe('/portable');
    expect(getPathnameFromDeepLink('/details', prefixes)).toBe('/details');
    expect(getPathnameFromDeepLink('', prefixes)).toBeNull();
  });

  it('does not duplicate routing frameworks with dedicated adapters or fixtures', () => {
    expect(fs.existsSync('src/next-app.ts')).toBe(false);
    expect(fs.existsSync('src/next-pages.ts')).toBe(false);
    expect(fs.existsSync('next-plugin')).toBe(false);
    expect(fs.existsSync('fixtures/next14-app/package.json')).toBe(false);
    expect(fs.existsSync('fixtures/next94-pages/package.json')).toBe(false);
  });

  it('shares the complete guarded JSX application across React 16, 17, 18, and 19', () => {
    const launchers = ['demo_react16', 'demo_react17', 'demo_react18', 'demo_react19'];
    launchers.forEach((directory) => {
      const packageJson = JSON.parse(fs.readFileSync(`${directory}/package.json`, 'utf8'));
      const sourceFiles: string[] = [];
      const collectFiles = (current: string) => fs.readdirSync(current, { withFileTypes: true })
        .forEach((entry) => {
          const path = `${current}/${entry.name}`;
          if (entry.isDirectory()) collectFiles(path);
          else sourceFiles.push(path.replace(`${directory}/src/`, ''));
        });
      collectFiles(`${directory}/src`);
      expect(sourceFiles.filter((path) => (
        !path.startsWith('templates/') && !path.endsWith('.d.ts')
      ))).toEqual(['index.tsx']);
      expect(packageJson.dependencies['react-view-router-react-demo-shared'])
        .toBe('file:../demo_react_shared');
    });

    const sharedRoutes = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/routes.ts',
      'utf8',
    );
    const sharedGuards = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/guards/component-guards.ts',
      'utf8',
    );
    const moduleApp = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/App.tsx',
      'utf8',
    );
    const moduleHistory = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/history/index.ts',
      'utf8',
    );
    const workspaceApp = fs.readFileSync(
      'demo_react_shared/src/workspace/App.tsx',
      'utf8',
    );
    const workspaceRoutes = fs.readFileSync(
      'demo_react_shared/src/workspace/routes.ts',
      'utf8',
    );
    const workspaceHistory = fs.readFileSync(
      'demo_react_shared/src/workspace/history/index.ts',
      'utf8',
    );
    const moduleStyles = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/App.scss',
      'utf8',
    );
    const guardLogSource = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/components/GuardLog.tsx',
      'utf8',
    );
    const guardLogStyles = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/components/GuardLog.scss',
      'utf8',
    );
    const homeSource = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/pages/Home.tsx',
      'utf8',
    );
    const mainSource = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/pages/Main.tsx',
      'utf8',
    );
    const someSource = fs.readFileSync(
      'demo_react_shared/src/examples/route-guards/pages/Some.tsx',
      'utf8',
    );
    const workspaceStyles = fs.readFileSync(
      'demo_react_shared/src/workspace/App.scss',
      'utf8',
    );
    expect(sharedRoutes).toContain('lazyImport');
    expect(sharedRoutes).toContain('footer: lazyImport');
    expect(sharedRoutes).toContain("path: 'other'");
    expect(sharedRoutes).toContain('beforeEnter(to: Route, from: Route | null, next: RouteNextFn)');
    expect(sharedGuards).toContain('beforeRouteEnter');
    expect(sharedGuards).toContain('beforeRouteLeave');
    expect(sharedGuards).toContain('enterInstanceCallback');
    expect(moduleHistory).toContain('new ReactViewRouter({ manual: true })');
    expect(moduleApp).toContain('useManualRouter(router, {');
    expect(moduleApp).toContain('export interface RouteGuardsAppProps');
    expect(moduleApp).toContain('basename: string;');
    expect(moduleApp).toContain("mode: NonNullable<ManualRouterOptions['mode']>;");
    expect(moduleApp).not.toContain('useMatchedRoute');
    expect(moduleApp).not.toContain('useRouter');
    expect(moduleApp).toContain("import './App.scss?scoped'");
    expect(workspaceApp).toContain('useRouteTitle({');
    expect(workspaceApp.match(/<RouterView\b/g)).toHaveLength(1);
    expect(workspaceApp).toContain('mode={appRouter.history}');
    expect(workspaceApp).toContain('siteRouteEntries');
    expect(workspaceApp).toContain('openedPaths');
    expect(workspaceApp).toContain('<ExampleIntro');
    expect(workspaceApp).toContain("import logo from './assets/logo-v5.png'");
    expect(workspaceApp).toContain('className="brand-logo"');
    expect(workspaceApp).toContain("icon.rel = 'icon'");
    expect(fs.existsSync('demo_react_shared/src/workspace/assets/logo-v5.png')).toBe(true);
    expect(workspaceRoutes).toContain("path: '/examples/guards'");
    expect(workspaceRoutes).toContain("path: '/playground'");
    expect(workspaceRoutes).toContain("defaultProps: { basename: '/examples/guards' }");
    expect(workspaceRoutes).toContain("title: 'routeGuards'");
    expect(workspaceRoutes).toContain("section: 'examples'");
    expect(workspaceRoutes).not.toContain("path: '/examples/guards/home");
    expect(workspaceHistory).toContain("import routes from '../routes'");
    expect(workspaceHistory).not.toContain("path: '/examples");
    expect(moduleStyles).toContain('&:scope {');
    expect(moduleStyles).not.toContain('.guard-log');
    expect(moduleStyles).not.toContain('.route-card');
    expect(moduleStyles).not.toContain('.page {');
    expect(guardLogSource).toContain("import './GuardLog.scss?scoped'");
    expect(guardLogStyles).toContain('.guard-log {');
    expect(guardLogStyles).toContain('& + & {');
    expect(homeSource).toContain("import './Home.scss?scoped'");
    expect(mainSource).toContain("import './Main.scss?scoped'");
    expect(someSource).toContain("import './Some.scss?scoped'");
    expect(workspaceStyles).toMatch(/\.app-header \{[\s\S]*?\.brand \{/);
    expect(workspaceStyles).toMatch(/\.site-menu-item \{[\s\S]*?&\.is-active/);

    const playgroundPage = fs.readFileSync(
      'demo_react_shared/src/playground/PlaygroundPage.tsx',
      'utf8',
    );
    const playgroundRuntime = fs.readFileSync(
      'demo_react_shared/src/playground/PlaygroundRuntime.tsx',
      'utf8',
    );
    const compilerWorker = fs.readFileSync(
      'scripts/playground/compiler-worker.js',
      'utf8',
    );
    const codeWorkspace = fs.readFileSync(
      'demo_react_shared/src/workspace/components/CodeWorkspace.tsx',
      'utf8',
    );
    const exampleIntro = fs.readFileSync(
      'demo_react_shared/src/workspace/components/ExampleIntro.tsx',
      'utf8',
    );
    const prepareAssets = fs.readFileSync(
      'scripts/prepare-playground-assets.js',
      'utf8',
    );
    expect(playgroundPage).toContain('new Worker(workerUrl)');
    expect(playgroundPage).toContain('sandbox="allow-scripts"');
    expect(playgroundPage).toContain('<CodeWorkspace');
    expect(codeWorkspace).toContain('createCodeFileTree(files)');
    expect(codeWorkspace).toContain('editable ?');
    expect(exampleIntro).toContain('loadExampleSources');
    expect(fs.readFileSync('demo_react_shared/src/workspace/example-source.ts', 'utf8')).toContain('fetch(url)');
    expect(exampleIntro).toContain('<CodeWorkspace');
    expect(prepareAssets).toContain("path.join(outputDirectory, 'examples.json')");
    expect(prepareAssets).toContain("path.join(referenceDirectory, 'api-documents.json')");
    expect(prepareAssets).toContain("'docs/api_CN.md'");
    expect(prepareAssets).toContain('collectReferenceDocuments');
    expect(playgroundRuntime).toContain('message.channel !== channel');
    expect(compilerWorker).toContain("importScripts('./typescript.js')");
    expect(compilerWorker).toContain('module: ts.ModuleKind.CommonJS');
    expect(compilerWorker).toContain('function compileScss(source)');
    expect(compilerWorker).not.toMatch(/https?:\/\//);

    launchers.forEach((directory) => {
      const packageJson = JSON.parse(fs.readFileSync(`${directory}/package.json`, 'utf8'));
      const overrideSource = fs.readFileSync(`${directory}/config-overrides.js`, 'utf8');
      expect(packageJson.devDependencies['babel-preset-react-scope-style'])
        .toBe('0.1.0-alpha.5');
      expect(packageJson.devDependencies.sass).toBeTruthy();
      expect(packageJson.devDependencies.typescript).toBe('6.0.3');
      expect(fs.existsSync(`${directory}/jsconfig.json`)).toBe(false);
      expect(fs.existsSync(`${directory}/tsconfig.json`)).toBe(true);
      const tsconfig = JSON.parse(fs.readFileSync(`${directory}/tsconfig.json`, 'utf8'));
      expect(tsconfig.compilerOptions.moduleResolution).toBe('Bundler');
      expect(tsconfig.compilerOptions.baseUrl).toBeUndefined();
      expect(packageJson.scripts.typecheck).toBe('tsc -p tsconfig.json');
      expect(overrideSource).toContain("config.resolve.alias.react = path.resolve(__dirname, 'node_modules/react')");
      expect(overrideSource).toContain("config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules/react-dom')");
      expect(overrideSource).toContain("config.resolve.alias['react-view-router/transition$']");
      expect(overrideSource).toContain("config.resolve.alias['react-view-router/drawer$']");
    });
    expect(fs.existsSync('demo_react16/jsconfig.json')).toBe(false);
    expect(fs.existsSync('demo_react_shared/.eslintrc.js')).toBe(true);
    expect(fs.existsSync('demo_react_shared/tsconfig.json')).toBe(true);
    const sharedPackage = JSON.parse(fs.readFileSync('demo_react_shared/package.json', 'utf8'));
    expect(sharedPackage.devDependencies.typescript).toBe('6.0.3');
    const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(rootPackage.devDependencies.typescript).toBe('6.0.3');
  });

  it('Chrome 49 fixture should pin a legacy stack and record real-engine verification', () => {
    const fixturePackage = JSON.parse(fs.readFileSync(
      'fixtures/chrome49-legacy/package.json',
      'utf8',
    ));
    const webpackConfig = fs.readFileSync(
      'fixtures/chrome49-legacy/webpack.config.js',
      'utf8',
    );
    const syntaxCheck = fs.readFileSync(
      'fixtures/chrome49-legacy/scripts/check-es5.js',
      'utf8',
    );
    const realBrowserRunner = fs.readFileSync(
      'fixtures/chrome49-legacy/scripts/run-chrome49.js',
      'utf8',
    );
    const verification = JSON.parse(fs.readFileSync(
      'fixtures/chrome49-legacy/verification.json',
      'utf8',
    ));

    expect(fixturePackage.dependencies.react).toBe('16.14.0');
    expect(fixturePackage.devDependencies.webpack).toBe('4.47.0');
    expect(webpackConfig).toContain("targets: { ie: '11' }");
    expect(syntaxCheck).toContain('ecmaVersion: 5');
    expect(realBrowserRunner).toContain('CHROME49_EXECUTABLE');
    expect(realBrowserRunner).not.toContain('--headless');
    expect(verification.browser.version).toBe('49.0.2623.75');
    expect(verification.status).toBe('passed');
  });
});
