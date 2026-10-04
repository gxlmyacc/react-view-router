import React, { useEffect, useState } from 'react';
import {
  RouterView,
  useManualRouter,
  useRouteTitle,
} from 'react-view-router';
import type {
  ManualRouterOptions,
  RouteTitleInfo,
} from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import routes from './routes';
import './App.scss?scoped';

interface HooksMetaAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

interface NavigationMeta {
  tab?: boolean;
  to?: string;
}

function getNavigation(title: RouteTitleInfo): NavigationMeta {
  return (title.meta.navigation || {}) as NavigationMeta;
}

function collectTabs(titles: RouteTitleInfo[]): RouteTitleInfo[] {
  return titles.reduce<RouteTitleInfo[]>((result, title) => {
    if (getNavigation(title).tab) result.push(title);
    if (title.children) result.push(...collectTabs(title.children));
    return result;
  }, []);
}

export default function HooksMetaApp({ basename, mode }: HooksMetaAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  const {
    titles,
    matchedTitles,
    currentPaths,
  } = useRouteTitle({ maxLevel: 2, filterMetas: ['navigation'] }, router);
  useEffect(() => start(), [start]);
  const selectedMenuId = currentPaths[currentPaths.length - 1];
  const routeOpenMenuKey = currentPaths.slice(0, -1).join('|');
  const [openMenuIds, setOpenMenuIds] = useState<string[]>([]);
  useEffect(() => {
    const routeOpenMenuIds = routeOpenMenuKey ? routeOpenMenuKey.split('|') : [];
    setOpenMenuIds(previous => routeOpenMenuIds.reduce(
      (result, menuId) => (result.indexOf(menuId) >= 0 ? result : result.concat(menuId)),
      previous,
    ));
  }, [routeOpenMenuKey]);
  const tabs = collectTabs(titles);
  const navigate = (title: RouteTitleInfo): void => {
    const navigation = getNavigation(title);
    router.push(navigation.to || title.path);
  };
  const toggleMenu = (menuId: string): void => {
    setOpenMenuIds(previous => (
      previous.indexOf(menuId) >= 0
        ? previous.filter(item => item !== menuId)
        : previous.concat(menuId)
    ));
  };
  const renderMenu = (items: RouteTitleInfo[]): React.ReactNode => (
    <ul>
      {items.map(title => {
        const isOpen = openMenuIds.indexOf(title.path) >= 0;
        return (
          <li className={isOpen ? 'is-open' : ''} key={title.path}>
            <button
              type="button"
              aria-expanded={title.children ? isOpen : undefined}
              className={selectedMenuId === title.path ? 'is-active' : ''}
              onClick={() => (title.children ? toggleMenu(title.path) : navigate(title))}
            >{t(title.title)}</button>
            {title.children && isOpen && renderMenu(title.children)}
          </li>
        );
      })}
    </ul>
  );
  return (
    <div className="hooks-meta-example">
      <header className="hooks-title-intro">
        <div>
          <strong>{t('hooksTitleDemo')}</strong>
          <span>{t('hooksTitleDemoDescription')}</span>
        </div>
        <div className="hooks-title-runtime">
          <code>maxLevel: 2</code>
          <code>filterMetas: ['navigation']</code>
          <code>{selectedMenuId || '—'}</code>
        </div>
      </header>
      <div className="hooks-workbench">
        <aside className="hooks-route-menu">
          <strong>{t('hooksGeneratedMenu')}</strong>
          {renderMenu(titles)}
        </aside>
        <section className="hooks-route-content">
          <nav className="hooks-route-tabs">
            {tabs.map(title => (
              <button
                type="button"
                className={selectedMenuId === title.path ? 'is-active' : ''}
                key={title.path}
                onClick={() => navigate(title)}
              >{t(title.title)}</button>
            ))}
          </nav>
          <div className="hooks-breadcrumb">
            {matchedTitles.map(title => t(title.title)).join(' / ') || '—'}
          </div>
          <div className="hooks-route-view"><RouterView router={router} /></div>
        </section>
      </div>
    </div>
  );
}
