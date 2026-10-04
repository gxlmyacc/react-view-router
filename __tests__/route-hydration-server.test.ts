/** @jest-environment node */

import {
  collectHydratableRoutes,
  wrapHydratableRouteElement,
  matchHydratableRoutes,
  resolveHydratableRoutes,
} from '../src/route-hydration-server';
import { lazyImport } from '../src/route-lazy';
import React from 'react';

function OverviewPage() {
  return null;
}

function MainPage() {
  return null;
}

function SidebarPage() {
  return null;
}

describe('server route hydration discovery', () => {
  const routes = [
    {
      path: '/account',
      children: [
        {
          path: 'overview',
          component: lazyImport(() => Promise.resolve(OverviewPage), { hydrate: true }),
        },
        {
          path: 'named',
          components: {
            main: lazyImport(() => Promise.resolve({
              __esModule: true,
              default: MainPage,
            }) as any, {
              hydrate: {
                runtime: 'reports',
                payloadRef: '#route-data',
                wrapElement: (element, info) => React.cloneElement(element, {
                  runtimeRouter: info.router,
                }),
              },
            }),
            sidebar: lazyImport(() => Promise.resolve(SidebarPage)),
          },
        },
      ],
    },
    {
      path: '/dynamic',
      children: () => [{
        path: 'detail',
        component: lazyImport(() => Promise.resolve(OverviewPage), { hydrate: true }),
      }],
    },
  ];

  it('collects hydrated views across static, dynamic, nested, and named routes', () => {
    const manifest = collectHydratableRoutes(routes);

    expect(manifest.map(({ route, viewName }) => `${route.path}:${viewName}`)).toEqual([
      '/account/overview:default',
      '/account/named:main',
      '/dynamic/detail:default',
    ]);
    expect(manifest[1].descriptor).toMatchObject({
      runtime: 'reports',
      payloadRef: '#route-data',
      owner: 'standalone-ssr',
    });
  });

  it('matches only hydrated views for the current request', () => {
    const overview = matchHydratableRoutes(routes, '/account/overview?tab=all');
    const named = matchHydratableRoutes(routes, '/account/named');

    expect(overview).toHaveLength(1);
    expect(overview[0].route.path).toBe('/account/overview');
    expect(overview[0].matchedRoute.path).toBe('/account/overview');
    expect(overview[0].router.mode).toBe('memory');
    expect(named.map(({ viewName }) => viewName)).toEqual(['main']);
    expect(matchHydratableRoutes(routes, '/missing')).toEqual([]);
  });

  it('loads only the matched hydrated components', async () => {
    const resolved = await resolveHydratableRoutes(routes, '/account/named');

    expect(resolved).toHaveLength(1);
    expect(resolved[0].component).toBe(MainPage);
    expect(resolved[0].viewName).toBe('main');

    const element = wrapHydratableRouteElement(
      resolved[0],
      React.createElement(MainPage, { source: 'server' } as any),
    );
    expect(element.props).toMatchObject({
      source: 'server',
      runtimeRouter: resolved[0].router,
    });
  });
});
