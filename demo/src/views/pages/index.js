import { normalizeRoutes, lazyImport } from 'react-view-router';
import Home from '../home';
import Login from '../login';

const routes = normalizeRoutes([
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: Home,
    // children routes
    children: [
      // path redirect
      { path: '/', redirect: 'main' },
      {
        path: 'main',
        // lazy load
        component: lazyImport(() => import(/* webpackChunkName: "home" */ '../home/main')),
        // route meta infos
        meta: { needLogin: true },
        children: [
          { path: '/', redirect: to => ({ path: 'some', query: { aa: 1, bb: 2 } }) },
          {
            path: 'some',
            components: {
              default: lazyImport(() => import(/* webpackChunkName: "home" */ '../home/main/some')),
              footer: lazyImport(() => import(/* webpackChunkName: "home" */ '../home/main/some/footer')),
            },
            // route guards:
            guards: {
              beforeEnter(to, from, next) { next(); },
              beforeLeave(to, from, next) { next(); },
              beforeUpdate(to, from) {},
              afterEnter(to, from) {},
              afterLeave(to, from) {},
            }
          },
          {
            path: 'other',
            component: lazyImport(() => import(/* webpackChunkName: "home" */ '../home/main/other')),
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

export default routes;