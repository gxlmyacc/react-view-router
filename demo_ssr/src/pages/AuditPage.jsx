import React from 'react';

export default function AuditPage() {
  return (
    <article id="audit-page">
      <h4>Hydrated audit route</h4>
      <p>This nested leaf re-enters the standalone SSR hydration path.</p>
    </article>
  );
}
