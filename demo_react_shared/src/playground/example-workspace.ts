import { createTranslator } from '../workspace/i18n';
import type { Locale } from '../workspace/i18n';
import { localizeExampleSource } from '../workspace/example-source';
import type { ExampleSourceWorkspace } from '../workspace/example-source';
import type { PlaygroundWorkspace } from './default-source';

/** Wrap the complete example in its runtime context and a memory router for the sandbox. */
export function createExampleWorkspace(exampleId: string, source: ExampleSourceWorkspace, locale: Locale): PlaygroundWorkspace {
  const t = createTranslator(locale);
  const prefix = `examples/${exampleId}`;
  const bootstrap = exampleId === 'memory-routing'
    ? `import { internalMemoryRouter, externalMemoryRouter, externalMemoryHistory } from './${prefix}/history';
import createMemoryRoutes from './${prefix}/routes';
internalMemoryRouter.use({ routes: createMemoryRoutes() });
internalMemoryRouter.start({ mode: HistoryType.memory, pathname: '/home' });
externalMemoryRouter.use({ routes: createMemoryRoutes() });
externalMemoryRouter.start({ mode: externalMemoryHistory });`
    : `import router from './${prefix}/history';
import routes from './${prefix}/routes';
// Initialize routes before mounting RouterView in the standalone preview.
router.use({ routes });
router.start({ mode: HistoryType.memory });`;
  return {
    entry: 'PlaygroundApp.tsx',
    files: [
      ...source.files.map(file => ({ path: `${prefix}/${file.path}`, content: localizeExampleSource(file, t) })),
      ...(source.dependencies || []).map(file => ({ ...file })),
      {
        path: 'PlaygroundApp.tsx',
        content: `import React from 'react';
import { HistoryType } from 'react-view-router';
import ExampleApp from './${prefix}/${source.entry}';
import { DemoRuntimeProvider } from './workspace/context';
${exampleId === 'route-guards' ? "import { getGuardStore } from './examples/route-guards/runtime';" : ''}

${bootstrap}

const store = ${exampleId === 'route-guards' ? 'getGuardStore()' : '{ loggedIn: false }'};

export default function PlaygroundApp(): React.ReactElement {
  return <DemoRuntimeProvider locale=${JSON.stringify(locale)} store={store}>
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <ExampleApp basename="" mode={HistoryType.memory} />
    </div>
  </DemoRuntimeProvider>;
}
`,
      },
    ],
  };
}
