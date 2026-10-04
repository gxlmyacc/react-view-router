import React, { useState } from 'react';
import { useRouter } from 'react-view-router';
import CodeBlock from '../components/CodeBlock';
import { useDemoRuntime } from '../context';
import {
  apiCategories,
  apiReferenceItems,
} from './api-reference';
import type { ApiCategory } from './api-reference';
import './ContentPages.scss?scoped';

const quickStartRoutesCode = `// routes.ts
import { normalizeRoutes } from 'react-view-router';
import Home from './pages/Home';

export default normalizeRoutes([
  { path: '/', index: '/home' },
  { path: '/home', component: Home },
]);`;

const quickStartRouterCode = `// router.ts
import ReactViewRouter from 'react-view-router';
import routes from './routes';

const router = new ReactViewRouter({ routes });

export default router;`;

const quickStartEntryCode = `// index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterView } from 'react-view-router';
import router from './router';

router.beforeEach((to, from, next) => {
  next();
});

ReactDOM.render(
  <RouterView router={router} />,
  document.getElementById('root') as HTMLElement,
);`;

const hostRoutesCode = `// workspace/routes.ts
import { normalizeRoutes } from 'react-view-router';
import Home from './pages/Home';
import OrdersModule from '../orders/App';

export default normalizeRoutes([
  { path: '/', index: '/home' },
  { path: '/home', component: Home },
  {
    path: '/modules/orders',
    component: OrdersModule,
    defaultProps: { basename: '/modules/orders' },
  },
]);`;

const moduleRouterCode = `// orders/App.tsx
import React, { useEffect } from 'react';
import ReactViewRouter, {
  RouterView,
  useManualRouter,
} from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import routes from './routes';

interface OrdersModuleProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

const router = new ReactViewRouter({ manual: true });

export default function OrdersModule({
  basename,
  mode,
}: OrdersModuleProps): React.ReactElement {
  const { start } = useManualRouter(router, {
    basename,
    mode,
    routes,
    manual: true,
  });

  useEffect(() => start(), [start]);
  return <RouterView router={router} />;
}`;

const routeConfigCode = `// routes.ts
import { lazyImport, normalizeRoutes } from 'react-view-router';
import Dashboard from './pages/Dashboard';

export default normalizeRoutes([
  { path: '/', index: '/dashboard' },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      title: 'dashboard',
      navigation: { order: 10 },
    },
    children: [
      {
        path: 'users/:userId',
        component: lazyImport(() => import('./pages/User')),
        paramsProps: ['userId'],
        queryProps: {
          tab: String,
          page: Number,
        },
      },
    ],
  },
  {
    path: '/legacy',
    exact: true,
    redirect: '/dashboard',
  },
]);`;

export function HomePage(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();
  return (
    <article className="content-page home-page">
      <section className="hero-panel">
        <span>{t('homeEyebrow')}</span>
        <h2>{t('siteHomeTitle')}</h2>
        <p>{t('homeDescription')}</p>
        <div className="hero-actions">
          <button type="button" onClick={() => router && router.push('/examples/basic-navigation')}>{t('exploreExamples')}</button>
          <button type="button" className="secondary" onClick={() => router && router.push('/quick-start')}>{t('readQuickStart')}</button>
        </div>
      </section>
      <section className="feature-grid">
        {[
          ['featureConfigTitle', 'featureConfigText'],
          ['featureGuardsTitle', 'featureGuardsText'],
          ['featureRuntimeTitle', 'featureRuntimeText'],
        ].map(([title, description]) => (
          <div className="feature-card" key={title}><h3>{t(title)}</h3><p>{t(description)}</p></div>
        ))}
      </section>
    </article>
  );
}

export function QuickStartPage(): React.ReactElement {
  const { t } = useDemoRuntime();
  const files = [
    ['routes.ts', quickStartRoutesCode],
    ['router.ts', quickStartRouterCode],
    ['index.tsx', quickStartEntryCode],
  ];
  return (
    <article className="content-page guide-page">
      <h2>{t('quickStartTitle')}</h2>
      <p>{t('quickStartDescription')}</p>
      <ol className="guide-steps">
        <li>{t('quickStartStepRoutes')}</li>
        <li>{t('quickStartStepRouter')}</li>
        <li>{t('quickStartStepView')}</li>
      </ol>
      <div className="guide-code-grid">
        {files.map(([file, source]) => (
          <section className="code-file" key={file}>
            <strong>{file}</strong>
            <CodeBlock
              code={source}
              language={file.endsWith('x') ? 'tsx' : 'ts'}
              showLanguage={false}
            />
          </section>
        ))}
      </div>
      <p className="guide-note">{t('quickStartGuardNote')}</p>
    </article>
  );
}

export function ArchitecturePage(): React.ReactElement {
  const { t } = useDemoRuntime();
  return (
    <article className="content-page guide-page architecture-page">
      <h2>{t('architectureTitle')}</h2>
      <p>{t('architectureDescription')}</p>
      <div className="architecture-flow" aria-label={t('architectureFlowLabel')}>
        <section><strong>{t('architectureHost')}</strong><span>{t('architectureHostDetail')}</span></section>
        <span aria-hidden="true">→</span>
        <section><strong>{t('architectureRoot')}</strong><span>{t('architectureRootDetail')}</span></section>
        <span aria-hidden="true">→</span>
        <section><strong>{t('architectureModule')}</strong><span>{t('architectureModuleDetail')}</span></section>
      </div>
      <ul className="architecture-rules">
        <li>{t('architectureRuleHost')}</li>
        <li>{t('architectureRuleModule')}</li>
        <li>{t('architectureRuleHistory')}</li>
      </ul>
      <div className="guide-code-grid two-columns">
        <section className="code-file">
          <strong>{t('architectureHostCode')}</strong>
          <CodeBlock code={hostRoutesCode} language="ts" showLanguage={false} />
        </section>
        <section className="code-file">
          <strong>{t('architectureModuleCode')}</strong>
          <CodeBlock code={moduleRouterCode} language="tsx" showLanguage={false} />
        </section>
      </div>
      <p className="guide-note">{t('architectureContextNote')}</p>
    </article>
  );
}

export function RouteConfigPage(): React.ReactElement {
  const { t } = useDemoRuntime();
  const rows = [
    ['index', 'routeConfigIndex'],
    ['redirect', 'routeConfigRedirect'],
    ['children', 'routeConfigChildren'],
    [':userId + paramsProps', 'routeConfigParams'],
    ['queryProps', 'routeConfigQueryProps'],
    ['meta', 'routeConfigMeta'],
    ['lazyImport(method)', 'routeConfigLazy'],
  ];
  return (
    <article className="content-page guide-page route-config-page">
      <h2>{t('routeConfigTitle')}</h2>
      <p>{t('routeConfigDescription')}</p>
      <div className="route-config-layout">
        <section className="code-file">
          <strong>routes.ts</strong>
          <CodeBlock code={routeConfigCode} language="ts" showLanguage={false} />
        </section>
        <dl className="config-reference">
          {rows.map(([name, description]) => (
            <React.Fragment key={name}>
              <dt><code>{name}</code></dt>
              <dd>{t(description)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
      <p className="guide-note">{t('routeConfigNestedViewNote')}</p>
    </article>
  );
}

export function FeatureIndexPage(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();
  const [category, setCategory] = useState<'all'|ApiCategory>('all');
  const [query, setQuery] = useState('');
  const [expandedApi, setExpandedApi] = useState<string>();
  const normalizedQuery = query.trim().toLowerCase();
  const items = apiReferenceItems.filter(item => {
    if (category !== 'all' && item.category !== category) return false;
    if (!normalizedQuery) return true;
    return `${item.name} ${t(item.description)}`.toLowerCase().indexOf(normalizedQuery) >= 0;
  });
  return (
    <article className="content-page guide-page api-reference-page">
      <h2>{t('featureIndexTitle')}</h2><p>{t('featureIndexDescription')}</p>
      <div className="api-toolbar">
        <label>
          <span>{t('apiSearch')}</span>
          <input
            type="search"
            value={query}
            placeholder={t('apiSearchPlaceholder')}
            onChange={event => setQuery(event.target.value)}
          />
        </label>
        <div className="api-filters" aria-label={t('apiCategory')}>
          {(['all'] as Array<'all'|ApiCategory>).concat(apiCategories).map(value => (
            <button
              type="button"
              className={category === value ? 'is-active' : ''}
              key={value}
              onClick={() => setCategory(value)}
            >{t(`apiCategory_${value}`)}</button>
          ))}
        </div>
      </div>
      <p className="api-result-count">{t('apiResultCount').replace('{count}', String(items.length))}</p>
      {items.length ? (
        <section className="api-reference-grid">
          {items.map(item => (
            <article className="api-reference-card" key={item.name}>
              <span>{t(`apiCategory_${item.category}`)}</span>
              <h3><code>{item.name}</code></h3>
              <p>{t(item.description)}</p>
              {expandedApi === item.name && item.details && (
                <ul className="api-reference-details">
                  {item.details.map(detail => <li key={detail}>{t(detail)}</li>)}
                </ul>
              )}
              <div className="api-reference-actions">
                {item.details && (
                  <button
                    type="button"
                    onClick={() => setExpandedApi(current => (
                      current === item.name ? undefined : item.name
                    ))}
                  >
                    {t(expandedApi === item.name ? 'hideApiDetails' : 'showApiDetails')}
                  </button>
                )}
                {item.examplePath && (
                  <button type="button" onClick={() => router && router.push(item.examplePath as string)}>
                    {t('openRelatedExample')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : <div className="api-empty">{t('apiEmpty')}</div>}
    </article>
  );
}

export function CompatibilityPage(): React.ReactElement {
  const { t } = useDemoRuntime();
  return (
    <article className="content-page guide-page">
      <h2>{t('compatibilityTitle')}</h2><p>{t('compatibilityDescription')}</p>
      <ul className="compatibility-list">
        {['compatibilityReact', 'compatibilityChrome', 'compatibilityNative', 'compatibilitySsr']
          .map(item => <li key={item}>{t(item)}</li>)}
      </ul>
    </article>
  );
}
