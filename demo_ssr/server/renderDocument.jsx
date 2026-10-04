import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  wrapHydratableRouteElement,
  resolveHydratableRoutes,
} from 'react-view-router';
import { routes } from '../src/router/routes';

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function RouteContent({ routeInfo }) {
  const Component = routeInfo.component;
  return wrapHydratableRouteElement(routeInfo, <Component />);
}

function renderRouteIsland(routeInfo) {
  const { descriptor } = routeInfo;
  return `<div
    data-react-viewssr-route="true"
    data-react-viewprotocol-version="${descriptor.protocolVersion}"
    data-react-viewroute-id="${escapeAttribute(descriptor.routeId)}"
  >${renderToString(<RouteContent routeInfo={routeInfo} />)}</div>`;
}

export default async function renderDocument(requestUrl) {
  const routeIslands = await resolveHydratableRoutes(routes, requestUrl);
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>ReactViewRouter SSR demo</title></head>
  <body>
    ${routeIslands.map(renderRouteIsland).join('\n    ')}
    <div id="app"></div>
    <script src="/client.js"></script>
  </body>
</html>`;
}
