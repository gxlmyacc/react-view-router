import React from 'react';
import { RouterView } from 'react-view-router';
import RouteNavigation from './components/RouteNavigation';

export default function App({ router }) {
  return (
    <main>
      <h1>ReactViewRouter mixed SSR/browser routes</h1>
      <RouteNavigation router={router} />
      <RouterView router={router} fallback={<p>Loading route…</p>} />
    </main>
  );
}
