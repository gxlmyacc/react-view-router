import React from 'react';
import { RouterView } from 'react-view-router';

export default function OverviewPage() {
  return (
    <section id="overview-page">
      <h3>Client overview layout</h3>
      <p>This intermediate route is rendered only in the browser.</p>
      <RouterView />
    </section>
  );
}
