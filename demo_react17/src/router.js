// routes.js
import ReactViewRouter, { normalizeRoutes, lazyImport } from 'react-view-router';
import Home from './home';
import Login from './login';

const routes = normalizeRoutes([
  { path: '/', index: 'home' },
  {
    path: '/home',
    component: Home,
    // children routes
    children: [
      // path redirect
      { path: '/', redirect: 'main' },
      // or path index
      // { path: '/', index: 'main' },
      {
        path: 'main',
        // lazy load
        component: lazyImport(() =>
          import(/* webpackChunkName: "home" */ './home/main')),
        // route meta infos
        meta: { needLogin: true },
        children: [
          {
            path: '/',
            redirect: to => ({ path: 'some', query: { aa: 1, bb: 2 } })
          },
          {
            path: 'some',
            components: {
              default: lazyImport(() =>
                import(/* webpackChunkName: "home" */ './home/main/some')),
              footer: lazyImport(() =>
                import(
                  /* webpackChunkName: "home" */ './home/main/some/footer.js'
                ))
            }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    component: Login
  }
]);

const router = new ReactViewRouter({
  routes // also can be passed by router.use method
});

export default router;
