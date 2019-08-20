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
  base: '',     // the base URL of the app. For example, if the entire single page application is served under /app/, then base should use the value "/app/"
  mode: 'hash', // or browser|histor|memory|abstract, default:hash
  routes: []    // also can be passed by router.use method
});
   
export default router;
```

```javascript
/// app.js
import React from 'react';
import { RouterView } from 'react-view-router';
import router from './router';
import routes from './routes';

router.use({ routes });

function App() {
  return (
    <div>
      <h1>App</h1>
      <RouterView router={router} />
    </div>
  );
}
```

```javascript
/// home/index.js
import React from 'react';
import { RouterView } from 'react-view-router';

export default function HomeIndex() {
  return (
    <div>
      <h1>HomeIndex</h1>
      <RouterView />
    </div>
  );
}
```

```javascript
/// home/main/index.js
import React from 'react';
import { RouterView } from 'react-view-router';

export default function HomeMainIndex() {
  return (
    <div>
      <h1>HomeMainIndex</h1>
      <RouterView />
      <RouterView name="footer" />
    </div>
  );
}
```
[Named Views](https://router.vuejs.org/guide/essentials/named-views.html#nested-named-views)

```javascript
/// home/home/main/some/index.js
import React from 'react';
import { useRouteGuards } from 'react-view-router';
import store from 'store';

class HomeMainSomeIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: 'text1' };
  }

  refresh = () => {
    this.setState({ text: 'text1 refreshed' })
  }

  render() {
    let { text } = this.state;
    return (
      <div>
        <h1>HomeMainSomeIndex</h1>
        { text }
      </div>
    );
  }
}

export default useRouteGuards(HomeMainSomeIndex, {
  beforeRouteEnter(to, from, next) {
    if (!store.logined) next('/login');
    else next(vm => vm.refresh());
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
import React from 'react';

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
import React from 'react';
import store from './store';
import router from './router';

export default function LoginIndex() {
  const doLogin = () => {
    store.logined = true;
    router.push({
      path: '/home',
      query: { aa: 1 }
    }, () => {
      console.log('router.push is complete!');
    }, () => {
      console.log('router.push is abort!');
    });
  };

  return (
    <div>
      <h1>LoginIndex</h1>
      <button onClick={doLogin}>Login</button>
    </div>
  );
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
        // route meta infos
        meta: { needLogin: true },
        children: [
          { path: '/', redirect: to => ({ path: 'some', query: { aa: 1, bb: 2 } }) },
          {
            path: 'some',
            components: {
              default: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some')),
              footer: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some/footer.js')),
            }
            // route guards:
            guards: {
              beforeEnter(to, from, next) { next(); }
              beforeLeave(to, from, next) { next(); }
              beforeUpdate(to, from) {}
              afterEnter(to, from) {}
              afterLeave(to, from) {}
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
])
```
[Per-Route Guard](https://router.vuejs.org/guide/advanced/navigation-guards.html#per-route-guard)


## APIs

### Route Option

- `path` URL string.
- `component` React component.
- `components` React components that be used for `Named RouterView`.
- `exact` Whether only matches with `location.pathname` exactly.
- `strict` When true, a path that has a trailing slash will only match a location.pathname with a trailing slash. This has no effect when there are additional URL segments in the location.pathname.
- `redirect` Navigates to new location, can be string, object or function.
- `children` Nested child routes.
- `meta` some custom route infos, see: [Route Meta Fields](https://router.vuejs.org/guide/advanced/meta.html).
- `props` Pass url params as a prop into route component.
- `paramsProps` Pass url params as props into route component.
- `queryProps` Pass url query as props into route component.
- `guards` the route guards, see:[Per-Route Guard](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-after-hooks)

### Route Component Props

Includes all props from `react-router-dom` and the following props.

- `route` current route infos.
- `parent` the RouterView instance.

### RouterView Props

- `name` Use for `Named Views`, see [vue-router instructions](https://router.vuejs.org/guide/essentials/named-views.html#nested-named-views)

### RouterLink Component
- `RouterLink` is `NavLink` component that in `react-router-dom`, just re-exported.

### ReactViewRouter Props
- `currentRoute` current matched route infos:
```javascript
{
  url: String,
  // A string that equals the path of the current route, always resolved as an absolute path
  path: String,
  // The full resolved URL including query and hash.
  fullPath: String,
  // true if the path matches the location.pathname exactly.
  isExart: Boolean,
  // An Array containing route records for all nested path segments of the current route.
  matched: Array,
  // An object that contains key/value pairs of dynamic segments and star segments. If there are no params the value will be an empty object.
  params: Object,
  // An object that contains key/value pairs of the query string. For example, for a path /foo?user=1, we get currentRoute.query.user == 1. If there is no query the value will be an empty object.
  query: Object,
  // The name of the route being redirected from, if there were one
  redirectedFrom: Object,
}
```
see: [Route Object Properties](https://router.vuejs.org/api/#route-object-properties)

### ReactViewRouter instance Methods
- `beforeEach` [global Before Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards)
- `afterEach` [global After Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-after-hooks)
- `push`、`replace`、`go`、`back`、`forward` `redirect`[history navigation methods](https://router.vuejs.org/guide/essentials/navigation.html)
- `parseQuery`、`stringifyQuery` Provide custom query string parse / stringify functions, can be override by `new ReactViewRouter({ parseQuery: parseQueryMethod, stringifyQuery: stringifyQueryMethod });`

### Export Methods
- `useRouteGuards` route component guards methods:
```javascript
/**
 * route component guards methods
 * @param {Object} component - route component
 * @param {Object} guards - guards methods 
 * @param {Class} [componentClass] - the route component class, it will be useful when component is High-order components
 * @return {RouteComponentGuards} - the route componet that can be regarded as `React.forwardRef`
 * /
function useRouteGuards(component, guards = {}, componentClass) {}
```

- `lazyImport` route component lazy load method:
```javascript
/**
 * route component lazy load method
 * @param {Function} importMethod - webpack lazy import method, For example: () => import('@/components/some-component')
 * @return {RouteLazy} - the result only be used with component or components props in route config
 * /
function lazyImport(importMethod) {}
```

- `normalizeRoutes` normalize route configs:
```javascript
/**
 * normalize route configs
 * @param {Array} routes - unnormalized route configs
 * @param {Object} [parent] - if provide, routes will be resolved regarded as parert`s children 
 * @return {Array} - normalized route configs 
 * /
function normalizeRoutes(routes, parent) {}
```
- `normalizeLocation` normalize location string or object:
```javascript
/**
 * normalize location string or object
 * @param {Object|string} to - location that need to normalize
 * @param {Object} [parent] - if provide, location will be resolved with parert
 * @return {Object} - normalized location object: { path: string, pathname: string, search: string, query: Object, ...custom props } 
 * /
function normalizeLocation(to, parent) {}
```

- `isLocation` determine whether `v` is a location object
```javascript
/**
 * determine whether `v` is a location object
 * @param {Object} v - the object to be determined
 * @return {boolean}
 * /
function isLocation(v) {}
```

- `withRouter` just re-export, see: [withRouter](https://reacttraining.com/react-router/web/api/withRouter)
- `matchPath` just re-export, see: [matchPath](https://reacttraining.com/react-router/web/api/matchPath)

## NOTE
1. You sholud config the  `Webpack Configuration` with `alias`:
```javascript
{
  ...
  resolve: {
    ...
    alias: {
      history: 'history-fix'
    }
  },
  ...
}
``` 
otherwise, webpack will package both `history` and `history-fix` into the target js file.

2. if route component is `Class Component` (not `Function Component`), then `this` variable in `afterRouteEnter`, `beforeRouteUpdate`,`beforeRouteLeave`,`afterRouteLeave` Component Guards and `afterEnter`,`beforeUpdate`,`beforeLeave`,`afterLeave` in Route Guards will be that component instance;

## License

[MIT](./LICENSE)

