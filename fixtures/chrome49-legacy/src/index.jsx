import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ReactViewRouter, { RouterView, lazyImport } from 'react-view-router';

function HomePage() {
  return <main data-testid="route-page">Chrome 49 home</main>;
}

function DetailsPage() {
  return <main data-testid="route-page">Chrome 49 lazy details</main>;
}

const router = new ReactViewRouter({
  manual: true,
  mode: 'browser',
  routes: [
    { path: '/', exact: true, component: HomePage },
    {
      path: '/details',
      component: lazyImport(() => Promise.resolve(DetailsPage)),
    },
    { path: '/blocked', component: HomePage },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.path === '/blocked') {
    next(false);
    return;
  }
  next();
});

function navigate(method, path, setResult) {
  setResult('pending');
  router[method](
    path,
    () => setResult('accepted'),
    () => setResult('rejected'),
  ).catch((error) => {
    // Guard rejection is expected; surface other navigation failures.
    if (error !== false) throw error;
  });
}

function App() {
  const [result, setResult] = useState('idle');

  return (
    <section>
      <h1>ReactViewRouter Chrome 49 fixture</h1>
      <button id="guarded" type="button" onClick={() => navigate('push', '/blocked', setResult)}>
        Guarded route
      </button>
      <button id="details" type="button" onClick={() => navigate('push', '/details', setResult)}>
        Lazy details
      </button>
      <button id="back" type="button" onClick={() => router.back()}>
        Back
      </button>
      <output data-testid="navigation-result">{result}</output>
      <RouterView router={router} fallback={<p>Loading legacy route…</p>} />
    </section>
  );
}

router.start();
ReactDOM.render(<App />, document.getElementById('root'));
