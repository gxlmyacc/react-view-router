import React, { useEffect, useMemo, useState } from 'react';
import { RouterView, useRouteTitle } from 'react-view-router';
import type ReactViewRouter from 'react-view-router';
import workspaceRouter from './history';
import { getGuardStore } from '../examples/route-guards/runtime';
import { DemoRuntimeProvider } from './context';
import { createTranslator, getInitialLocale } from './i18n';
import { findSiteRouteEntry, siteRouteEntries } from './navigation';
import type { SiteRouteEntry, SiteSection } from './navigation';
import ExampleIntro from './components/ExampleIntro';
import logo from './assets/logo-v5.png';
import './App.scss';

export interface AppProps {
  router?: ReactViewRouter;
}

const sectionOrder: SiteSection[] = ['overview', 'guides', 'examples'];

export default function App({ router: appRouter = workspaceRouter }: AppProps): React.ReactElement {
  const [locale, setLocale] = useState(getInitialLocale);
  const [openedPaths, setOpenedPaths] = useState<string[]>(['/home']);
  const t = createTranslator(locale);
  const { currentPaths: [currentPath], titles } = useRouteTitle({
    matchedOffset: 1,
    maxLevel: 1,
    filterMetas: ['site', 'example'],
  }, appRouter);
  const currentEntry = findSiteRouteEntry(currentPath);
  const visibleEntries = useMemo(() => {
    const paths = titles.map(item => item.path);
    return siteRouteEntries.filter(entry => paths.indexOf(entry.path) >= 0);
  }, [titles]);

  useEffect(() => {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/png';
    icon.href = logo;
    icon.setAttribute('data-react-view-router-site-icon', 'true');
    document.head.appendChild(icon);
    return () => {
      if (icon.parentNode) icon.parentNode.removeChild(icon);
    };
  }, []);

  useEffect(() => {
    if (!currentEntry || currentEntry.navigation.tab === false) return;
    setOpenedPaths(paths => (
      paths.indexOf(currentEntry.path) >= 0 ? paths : paths.concat(currentEntry.path)
    ));
  }, [currentEntry]);

  const navigate = (path: string): void => {
    if (path !== currentPath || (path === '/api' && appRouter.currentRoute?.query.document)) appRouter.push(path);
  };

  const closeTab = (entry: SiteRouteEntry): void => {
    const index = openedPaths.indexOf(entry.path);
    if (index < 0 || entry.navigation.closable === false) return;
    const nextPaths = openedPaths.filter(path => path !== entry.path);
    setOpenedPaths(nextPaths);
    if (entry.path === currentPath) navigate(nextPaths[Math.max(0, index - 1)] || '/home');
  };

  const topEntries = visibleEntries.filter(entry => entry.navigation.topNav);
  const openedEntries = openedPaths
    .map(findSiteRouteEntry)
    .filter((entry): entry is SiteRouteEntry => Boolean(entry));

  return (
    <DemoRuntimeProvider store={getGuardStore()} locale={locale} setLocale={setLocale}>
      <div className="app-shell">
        <header className="app-header">
          <button className="brand" type="button" onClick={() => navigate('/home')}>
            <img className="brand-logo" src={logo} alt="" />
            <span className="brand-copy">
              <strong>{t('appTitle')}</strong>
              <span>{t('appSubtitle')}</span>
            </span>
          </button>
          <nav className="top-navigation">
            {topEntries.map(entry => {
              const exampleActive = (currentPath || '').indexOf('/examples/') === 0
                && entry.path.indexOf('/examples/') === 0;
              return (
                <button
                  className={exampleActive || entry.path === currentPath ? 'is-active' : ''}
                  type="button"
                  key={entry.path}
                  onClick={() => navigate(entry.path)}
                >
                  {t(entry.navigation.navTitle || entry.title)}
                </button>
              );
            })}
          </nav>
          <button
            className="language-switch"
            type="button"
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          >
            {locale === 'zh' ? 'English' : '中文'}
          </button>
        </header>
        <div className="app-body">
          <aside className="site-sidebar">
            {sectionOrder.map(section => {
              const entries = visibleEntries.filter(entry => entry.navigation.section === section);
              if (!entries.length) return null;
              return (
                <section key={section}>
                  <strong>{t(section)}</strong>
                  {entries.map(entry => (
                    <button
                      className={`site-menu-item${entry.path === currentPath ? ' is-active' : ''}`}
                      type="button"
                      key={entry.path}
                      onClick={() => navigate(entry.path)}
                    >
                      {t(entry.title)}
                    </button>
                  ))}
                </section>
              );
            })}
          </aside>
          <div className="workspace-content">
            <nav className="route-tabs">
              {openedEntries.map(entry => (
                <div className={`route-tab${entry.path === currentPath ? ' is-active' : ''}`} key={entry.path}>
                  <button type="button" onClick={() => navigate(entry.path)}>{t(entry.title)}</button>
                  {entry.navigation.closable !== false && (
                    <button
                      className="close-tab"
                      type="button"
                      title={t('closeTab')}
                      aria-label={`${t('closeTab')}: ${t(entry.title)}`}
                      onClick={() => closeTab(entry)}
                    >×</button>
                  )}
                </div>
              ))}
            </nav>
            <main className={`site-main${currentEntry && currentEntry.example ? ' has-example-intro' : ''}`}>
              {currentEntry && <ExampleIntro entry={currentEntry} t={t} onDebug={exampleId => {
                appRouter.push({ path: '/playground', query: { exampleId } });
              }} />}
              <div className="route-stage">
                <RouterView router={appRouter} mode={appRouter.history} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </DemoRuntimeProvider>
  );
}
