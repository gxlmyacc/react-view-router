import React from 'react';
import { RouteRuntimeAdapterProvider, lazyImport } from 'react-view-router';
import SSRPage from '../pages/SSRPage';
import ReportsPage from '../pages/ReportsPage';
import ClientPage from '../pages/ClientPage';
import WorkspacePage from '../pages/WorkspacePage';
import OverviewPage from '../pages/OverviewPage';
import LocalToolsPage from '../pages/LocalToolsPage';
import AuditPage from '../pages/AuditPage';

let routeRuntimeAdapter = null;

export function setRouteRuntimeAdapter(adapter) {
  routeRuntimeAdapter = adapter;
}

function provideRouteRuntime(element, { router }) {
  const routeElement = React.cloneElement(element, { router });
  if (!routeRuntimeAdapter) return routeElement;
  return (
    <RouteRuntimeAdapterProvider value={routeRuntimeAdapter}>
      {routeElement}
    </RouteRuntimeAdapterProvider>
  );
}

export const routes = [
  {
    path: '/ssr',
    component: lazyImport(() => Promise.resolve(SSRPage), { hydrate: true }),
  },
  {
    path: '/reports',
    component: lazyImport(() => Promise.resolve(ReportsPage), { hydrate: true }),
  },
  {
    path: '/client',
    component: lazyImport(() => Promise.resolve(ClientPage)),
  },
  {
    path: '/workspace',
    component: lazyImport(() => Promise.resolve(WorkspacePage), {
      hydrate: { wrapElement: provideRouteRuntime },
    }),
    children: [
      {
        path: 'overview',
        component: lazyImport(() => Promise.resolve(OverviewPage)),
        children: [
          {
            path: 'tools',
            component: lazyImport(() => Promise.resolve(LocalToolsPage)),
          },
          {
            path: 'audit',
            component: lazyImport(() => Promise.resolve(AuditPage), { hydrate: true }),
          },
        ],
      },
    ],
  },
];
