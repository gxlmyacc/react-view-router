import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouteRuntimeAdapterProvider } from 'react-view-router';
import { createModernStandaloneRouteSSRAdapter } from 'react-view-router/standalone-modern';
import App from '../App';
import router from '../router';
import { setRouteRuntimeAdapter } from '../router/routes';

const runtimeAdapter = createModernStandaloneRouteSSRAdapter({ document });
setRouteRuntimeAdapter(runtimeAdapter);
const appContainer = document.getElementById('app');

createRoot(appContainer).render(
  <RouteRuntimeAdapterProvider value={runtimeAdapter}>
    <App router={router} />
  </RouteRuntimeAdapterProvider>,
);
