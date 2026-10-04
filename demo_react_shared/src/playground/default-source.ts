export interface PlaygroundFile {
  path: string;
  content: string;
}

export interface PlaygroundWorkspace {
  entry: string;
  files: PlaygroundFile[];
}

const defaultWorkspace: PlaygroundWorkspace = {
  entry: 'src/App.tsx',
  files: [
    {
      path: 'src/App.tsx',
      content: `import React from 'react';
import { RouterView, useRoute } from 'react-view-router';
import router from './router';
import routes from './routes';
import './styles.scss';

router.use({ routes });

export default function PlaygroundApp(): React.ReactElement {
  const route = useRoute(router, { watch: true });
  React.useEffect(() => {
    router.start();
    return () => router.stop();
  }, []);

  return (
    <main className="playground-app">
      <h2>ReactViewRouter Playground</h2>
      <p><code>{route?.fullPath}</code></p>
      <nav>
        <button onClick={() => router.push('/home')}>Home</button>
        <button onClick={() => router.push('/users/42')}>User 42</button>
      </nav>
      <RouterView router={router} />
    </main>
  );
}`,
    },
    {
      path: 'src/router.ts',
      content: `import ReactViewRouter, { HistoryType } from 'react-view-router';

const router = new ReactViewRouter({
  manual: true,
  mode: HistoryType.memory,
  pathname: '/home',
});

export default router;`,
    },
    {
      path: 'src/routes.ts',
      content: `import { normalizeRoutes } from 'react-view-router';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';

export default normalizeRoutes([
  { path: '/', index: 'home' },
  { path: 'home', component: HomePage },
  { path: 'users/:userId', component: UserPage },
]);`,
    },
    {
      path: 'src/pages/HomePage.tsx',
      content: `import React from 'react';

export default function HomePage(): React.ReactElement {
  return (
    <section className="route-card">
      <h3>Home</h3>
      <p>This page is rendered by RouterView.</p>
    </section>
  );
}`,
    },
    {
      path: 'src/pages/UserPage.tsx',
      content: `import React from 'react';
import { useRoute, useRouter } from 'react-view-router';

export default function UserPage(): React.ReactElement {
  const router = useRouter();
  const route = useRoute(router, { watch: true });
  return (
    <section className="route-card">
      <h3>User</h3>
      <p>Current route: {route?.fullPath}</p>
      <p>User ID: {route?.params.userId}</p>
    </section>
  );
}`,
    },
    {
      path: 'src/styles.scss',
      content: `.playground-app {
  padding: 20px;
  color: #18372d;
  font-family: Arial, sans-serif;
}

.playground-app nav {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.playground-app button {
  padding: 7px 10px;
  border: 1px solid #79b36f;
  border-radius: 5px;
  background: #eff9ec;
  cursor: pointer;
}

.route-card {
  padding: 14px;
  border: 1px solid #cce4c7;
  border-radius: 8px;
  background: #f7fcf5;
}`,
    },
  ],
};

export default defaultWorkspace;
