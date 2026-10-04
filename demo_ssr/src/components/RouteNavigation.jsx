import React from 'react';

export default function RouteNavigation({ router }) {
  return (
    <nav aria-label="Route examples">
      <button type="button" onClick={() => router.push('/ssr')}>SSR route</button>
      <button type="button" onClick={() => router.push('/reports')}>SSR reports</button>
      <button type="button" onClick={() => router.push('/client')}>Browser route</button>
      <button type="button" onClick={() => router.push('/workspace/overview/tools')}>Nested client leaf</button>
      <button type="button" onClick={() => router.push('/workspace/overview/audit')}>Nested SSR leaf</button>
    </nav>
  );
}
