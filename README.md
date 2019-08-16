# `react-view-router`

[![NPM version](https://img.shields.io/npm/v/react-view-router.svg?style=flat)](https://npmjs.com/package/react-view-router)
[![NPM downloads](https://img.shields.io/npm/dm/react-view-router.svg?style=flat)](https://npmjs.com/package/react-view-router)

> Route configuration component for `react-router-dom`. write route config like vue-router in react. see: [Nested Routes](https://router.vuejs.org/guide/essentials/nested-routes.html)

## Installation

```bash
npm install react-view-router --save
# or
yarn add react-view-router
```

## Basic Usage

```javascript
/// router.js
import ReactViewRouter from 'react-view-router';

const router = new ReactViewRouter({ 
  mode: 'hash' // or browser|histor|memory|abstract,
});
   
export default router;
```

```javascript
/// app.js
import { RouterView } from 'react-view-router';
import router from './router';
import routes from './routes';
import { createHashHistory } from 'history';

router.use({ routes });

function App() {
  return (
    <div>
      <h1>App</h1>
      <RouterView router={router} />
    </div>
  )
}
```

```javascript
/// home/index.js
import { RouterView } from 'react-view-router';

export default function HomeIndex() {
  return (
    <div>
      <h1>HomeIndex</h1>
      <RouterView />
    </div>
  )
}
```

```javascript
/// home/main/index.js
import { RouterView } from 'react-view-router';

export default function HomeMainIndex() {
  return (
    <div>
      <h1>HomeMainIndex</h1>
      <RouterView />
      <RouterView name="footer">
    </div>
  )
}
```
[Named Views](https://router.vuejs.org/guide/essentials/named-views.html#nested-named-views)

```javascript
/// home/home/main/some/index.js
import { RouterView, useRouteGuards } from 'react-view-router';
import store from 'store';

function HomeMainSomeIndex() {
  return (
    <div>
      <h1>HomeMainSomeIndex</h1>
    </div>
  )
}

export default useRouteGuards(HomeMainSomeIndex, {
  beforeRouteEnter(to, from, next) {
    if (!store.logined) next('/login');
    else next();
  },
  beforeRouteLeave(to, from, next) {
    // confirm leave prompt
    next();
  },
  beforeRouteUpdate(to, from) {

  },
  afterRouteEnter(to, from) {

  },
  afterRouteLeave(to, from) {

  },
});
```
[In Component Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#in-component-guards)

```javascript
/// home/main/some/footer.js
import { RouterView } from 'react-view-router';

export default function HomeMainSomeFooter() {
  return (
    <div>
      <h1>HomeMainSomeFooter</h1>
    </div>
  )
}
```

```javascript
/// login/index.js
import { RouterView } from 'react-view-router';

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
    </div>
  )
}
```

```javascript
/// routes.js
import { normalizeRoutes, lazyImport } from 'react-view-router';
import Home from './home';
import Login from './login';

const routes = normalizeRoutes([
  {
    path: '/home',
    component: Home
    // children routes
    children: [
      // path redirect
      { path: '/', redirect: 'main' },
      {
        path: 'main',
        // lazy load
        component: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main')),
        children: [
          { path: '/', redirect: to => ({ path: 'some', query: { aa: 1, bb: 2 } }) },
          {
            path: 'some',
            component: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some')),
            components: {
              footer: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some/footer.js')),
            }
            // route guards:
            // beforeEnter(to, from, next) { next(); }
            // beforeLeave(to, from, next) { next(); }
            // beforeUpdate(to, from) {}
            // afterEnter(to, from) {}
            // afterLeave(to, from) {}
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    component: Login
  }
])
```
[Per-Route Guard](https://router.vuejs.org/guide/advanced/navigation-guards.html#per-route-guard)


## APIs

### Route Option

- `path` URL string.
- `component` React component.
- `components` React components that be used for `Named RouterView`.
- `exact` Whether only matches with `location.pathname` exactly.
- `redirect` Navigates to new location, can be string or function.
- `children` Nested child routes.
- `meta` some custom route infos, see: [Route Meta Fields](https://router.vuejs.org/guide/advanced/meta.html).
- `props` Pass url params as a prop into route component.
- `paramsProps` Pass url params as props into route component.
- `queryProps` Pass url query as props into route component.

### Route Component Props

Includes all props from `react-router` and the following props.

- `route` current route infos.
- `parent` the RouterView instance.

### RouterView Props

- `name` Use for `Named Views`, see [vue-router instructions](https://router.vuejs.org/guide/essentials/named-views.html#nested-named-views)

### ReactViewRouter Props
- `currentRoute` current matched route infos:
```javascript
{
  path: String,
  url: String,
  isExart: Boolean,
  matched: Array,
  params: Object,
  query: Object
}
```
see: [Route Object Properties](https://router.vuejs.org/api/#route-object-properties)

### ReactViewRouter instance Methods
- `beforeEach` [global Before Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards)
- `afterEach` [global After Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-after-hooks)
- `push`、`replace`、`go`、`back`、`forward` [history navigation methods](https://router.vuejs.org/guide/essentials/navigation.html)
- `parseQuery`、`stringifyQuery` Provide custom query string parse / stringify functions, can be override by `new ReactViewRouter({ parseQuery: parseQueryMethod, stringifyQuery: stringifyQueryMethod });`

## License

[MIT](./LICENSE)

