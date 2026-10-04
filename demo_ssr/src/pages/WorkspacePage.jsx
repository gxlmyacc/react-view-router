import React from 'react';
import { RouterView } from 'react-view-router';

export default function WorkspacePage({ router }) {
  const canRenderBrowserRoutes = typeof document !== 'undefined';
  return (
    <section id="workspace-page">
      <h2>Hydrated workspace layout</h2>
      <p>This server-rendered layout owns a browser-rendered child RouterView.</p>
      {canRenderBrowserRoutes ? <RouterView router={router} depth={1} /> : null}
    </section>
  );
}
