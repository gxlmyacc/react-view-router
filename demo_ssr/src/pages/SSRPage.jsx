import React from 'react';

export default function SSRPage() {
  return (
    <article id="ssr-page">
      <h2>Standalone SSR route</h2>
      <p>This markup was rendered by the server and hydrated as a route island.</p>
    </article>
  );
}
