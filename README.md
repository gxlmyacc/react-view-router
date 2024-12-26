  # react-view-router

  A route management component that is configured for routing, and supports various routing event interception and redirection operations.

  [![NPM version](https://img.shields.io/npm/v/react-view-router.svg?style=flat)](https://npmjs.com/package/react-view-router)
[![NPM downloads](https://img.shields.io/npm/dm/react-view-router.svg?style=flat)](https://npmjs.com/package/react-view-router)

> A Route manager for `react` can write routing configuration like [vue-router](https://router.vuejs.org/guide/#javascript) in react. see: [Nested Routes](https://router.vuejs.org/guide/essentials/nested-routes.html)

> Unlike 1.x, `react-view-router@2.x` does not depend on the [react-router](https://github.com/ReactTraining/react-router) Library

> see [react-view-router@1.x](https://github.com/gxlmyacc/react-view-router/tree/1.x)


## [中文说明](./README_CN.md)
  

  ## Installation

  ```bash
  npm install react-view-router --save
  # or
  yarn add react-view-router
  ```

  ## Basic Usage

  ### Example

  ```javascript
  /// router.js
  import ReactViewRouter from 'react-view-router';
  import routes from './routes';
  const router = new ReactViewRouter({
    basename: '',     // app's basename, if the page route is under /app/, the value of base should be "/app/"
    mode: 'hash',    // route type browser|memory|hash, default:hash
    routes: routes   // route configuration array, you can also use the router.use method to initialize
  });
    
  export default router;
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
      // sub-routes
      children: [
        // path redirection
        { path: '/', redirect: 'main' },
        // default (index) path
        // { path: '/', index: 'main' },
        {
          path: 'main',
          // lazy loading
          component: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main')),
          // route meta information
          meta: { needLogin: true },
          children: [
            // redirection
            { path: '/', redirect: to => ({ path: 'some', query: { aa: 1, bb: 2 } }) },
            {
              path: 'some',
              components: {
                default: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some')),
                footer: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some/footer.js')),
              }
              // route guard:
              beforeEnter(to, from, next) { next(); }
              beforeLeave(to, from, next) { next(); }
              beforeUpdate(to, from) {}
              afterLeave(to, from) {}
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

  ```javascript
  /// app.js
  import React from 'react';
  import { RouterView } from 'react-view-router';
  import router from './router';

  router.beforeEach((to, from, next) => {
    if (to) {
      console.log(
        '%croute changed',
        'background-color:#ccc;color:green;font-weight:bold;font-size:14px;',
        to.url, to.query, to.meta, to.redirectedFrom
      );
      return next();
    }
  });

  function App() {

    const filter = routes => routes.filter(r => r.meta.visible !== false);

    return (
      <div>
        <h1>App</h1>
        {
          // RouterView needs router parameter 
        }
        <RouterView 
          router={router}
          fallback={<div>loading</div>}
        />
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
  [Named Views](https://router.vuejs.org/zh/guide/essentials/named-views.html#嵌套命名视图)

  ```javascript
  /// home/main/some/index.js
  import React from 'react';
  import { withRouteGuards } from 'react-view-router';
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

  export default withRouteGuards(HomeMainSomeIndex, {
    beforeRouteEnter(to, from, next) {
      if (!store.logined) next('/login');
      else next(vm => vm.refresh());
    },
    beforeRouteLeave(to, from, next) {
      // You can confirm whether to leave here
      next();
    },
    beforeRouteUpdate(to, from) {

    },
    afterRouteLeave(to, from) {

    },
  });
  ```

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


  ## APIs

  ### Route Configuration Options
  - `name` Route name, equivalent to alias, the route name should be unique in all route configurations of a router, and can be used to adjust the route, such as: `router.push('[aRouteName]/somepath')`, `name` can contain the following characters: `A-z.\-_#@$%^&*():|?<>=+`
  - `path` URL string.
  - `component` The component corresponding to the route.
  - `components` The component corresponding to the route, can be used for `named RouterView`, `component` corresponds to `components.default`.
  - `exact` Whether to strictly match `location.pathname`.
  - `redirect` The route will be redirected to a new address, which can be a string, object or function.
  - `index` Default route name, can be a string or function.
  - `children` Nested child route configuration information.
  - `meta` Custom meta information of the route, see: [Route Meta Information](https://router.vuejs.org/zh/guide/advanced/meta.html).
  - `metaComputed` Meta information in the route configuration (computed). When a value in meta is a function, it will be treated as the value of the `RouteMetaFunction` function execution result.
  - `defaultProps` Value is an object, format: `{ aa: 1, bb: '2', cc: true }`, add additional pros parameters when rendering the route component.
  - `props` boolean or object, format: `{ aa: Number, bb: String, cc: Boolean }`, pass the specified attribute in the params parameter of the route as props to the route component, which is an alias of `paramsProps` below.
  - `paramsProps` boolean or object, format: `{ aa: Number, bb: String, cc: Boolean }`, pass the specified attribute in the params parameter of the route as props to the route component.
  - `queryProps` boolean or object, format: `{ aa: Number, bb: String, cc: Boolean }`, pass the specified attribute in the query parameter of the route as props to the route component.
  - `guards` Route guard, refers to `beforeEnter`, `beforeLeave`, `beforeUpdate`, `afterLeave`, see:[Per-Route Guard](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#全局前置守卫)
  - `isComplete` boolean, whether the route has completed the interception process. During the route jump process, it is often necessary to redirect processing. For the route object `Route` that has not been finally completed, the `isComplete` will be `false`.

  ### RouterView Props

  - `name` Used for `named views`, see [vue-router explanation](https://router.vuejs.org/zh/guide/essentials/named-views.html#嵌套命名视图)
  - `filter` Function: `function (routes: Array) { return [] }`, can be used to filter matching routes
  - `fallback` Can be a function: `function ({ parentRoute, currentRoute, inited, resolving, depth }) { return <div /> }`, or `React Component Element`, such as: `<Loading>loading</Loading>` 

  ### RouterLink Props

  The `RouterLink` component is a component similar to the `Link` component in `react-router`. It can implement route adjustment and highlight itself based on whether it matches the current route.

  Usage example:

  ```js
  import React from 'react';
  import { RouterLink } from 'react-view-router';

  export default function HomeIndex() {
    return (
      <div>
        <RouterLink tag="a" to={{ path: '/login' }}>Login</RouterLink>
        <RouterLink tag="a" to="/admin" replace>Settings</RouterLink>
      </div>
    );
  }
  ```

  #### router: ReactViewRouter

  The `ReactViewRouter` instance associated with the `RouterLink`, when the `RouterLink` is at the same level or above the `RouterView`, this property is required; otherwise, the `RouterLink` will automatically find the associated `ReactViewRouter` instance based on the React component hierarchy.

  #### to: RouteLocation|string
    
  Represents the link of the target route. When clicked, the value of `to` is immediately passed to `router.push()` or `router.replace()`, so this value can be a string or an object that describes the target location. The object format is:

  ```ts
  {
    // Jump route address
    path?: string,
    // Query parameters
    query?: Partial<any>,
    // Dynamic parameters
    params?: Partial<any>,
    // Whether to append to the current route
    append?: boolean,
    // Whether it is an absolute address
    absolute?: boolean | 'hash' | 'browser' | 'memory',
    // The number of steps to go back before the jump route, an integer means forward, a negative number means backward
    delta?: number,
    // If the route to be jumped is already in the history route stack, then go back instead of push/replace, this parameter will be useful when a series of routes are jumped and want to return to the home page without generating new route history
    backIfVisited?: boolean,
    // If this parameter is true, when the `push` or `replace` method is called, if the current `router` is not ready (`!router.isPrepared`) and is in the interceptor processing (`beforeEach`, `beforeRouterEnter`, `beforeRouterLeave`), the interceptor processing will not be resolved, but will be changed to set `pendingRoute`;
    pendingIfNotPrepared?: boolean,
  }
  ```

  #### replace: boolean
    
  If the `replace` attribute is set, when clicked, `router.replace()` will be called instead of `router.push()`, so the navigation will not leave a `history` record.

  #### append：boolean
    
  After setting the `append` attribute, the base path is added to the current (relative) path. For example, if we navigate from `/a` to a relative path `b`, if `append` is not configured, the path is `/b`, if configured, it is `/a/b`. This attribute is equivalent to `append` in the jump object

  #### tag: string|React.ElementType

  Sometimes you want the `RouterLink` to be rendered as a certain tag, such as `<li>`. So we use the `tag` attribute to specify which tag to use, and it will still listen for clicks and trigger navigation.

  #### activeClass: string = 'router-link-active'

  The class name added when the `RouterLink` matches the current route;

  #### exact: boolean

  Whether the `RouterLink` component should only be activated in exact match mode. The default class name is based on the inclusion match. For example, if the current path starts with `/a`, the `RouterLink` will also be set with the `CSS` class name. According to this rule, every route will activate the `<RouterLink to="/" />`! If you want the link to use "exact match mode", use the `exact` attribute:

  #### exactActiveClass: string = 'exact-active-class'

  Configure the `class` that should be activated when the link is exactly matched.

  #### event: 'click'|'mouse-enter'|'mouse-leave' and other React-supported component event names = 'click'

  Configure the event name that triggers the jump event, which can be any React-supported component event.

  #### onRouteChange: (route: Route) => void
    
  Event when the route changes

  #### onRouteActive: (route: Route) => void
    
  Triggered when the `RouterLink` component matches the current route

  #### onRouteInactive: (route: Route) => void
    
  Triggered when the `RouterLink` component changes from a matching state to a non-matching state


  ### ReactViewRouter options

  The `options` option is used in the creation of the `ReactViewRouter` instance, or the `use`, `start` method parameters. It supports the following parameters:

  - `name: string` You can provide a name for this `ReactViewRouter` for easy identification

  - `basename: string` The base path of the path component

  - `mode: 'hash'|'memory'|'browser'|History` - Route mode

  - `hashType: 'slash'|'noslash'` When `mode` is `hash`, configure whether the `hash` path starts with `/`

  - `pathname: string` - Used in the `memory` route mode, used to specify the initial route address of the `memory` route

  - `history: History` - The `history` object of the `ReactViewRouter`, when not passed, the `ReactViewRouter` will create it internally, this property is generally used when the route is in `memory` mode, by passing its `router.history` to the child application's `ReactViewRouter`, the `memory` route of the child application can be linked with the `memory` route of the parent application.

  - `routes: ConfigRoute[]` - All route configuration list

  - `queryProps: { [key: string]: (val: string) => any; }` url parameter type conversion object

  - `manual: boolean` Whether it is manual mode, which means that the `start` method is not automatically called when `new ReactViewRouter()` is called. In this case, you need to manually call the `start` method to enable the route listener, and the `ReactViewRouter` instance will not start working until the `start` method is called

  - `rememberInitialRoute: boolean` Whether to remember the `initialRoute`. When it is `true`, when refreshing the browser page, the `initialRoute` is no longer the route information recorded in the current url, but the route information of the first time retrieved from the sessionStroage. This function is mainly used to solve the problem of losing the initialized url parameters when refreshing the page

  - `holdInitialQueryProps: boolean` - Whether to merge the `query` of the initial route (`initialRoute`) into the `query` of the jump route when calling the `push`, `replace` and other route jump methods. This parameter will be more effective in some systems that need to keep the url parameters all the time;

  ### ReactViewRouter properties

  - `currentRoute` Current matching route information:

  ```javascript
  {
    // The operation type of the current route, there are: POP, PUSH, REPLACE
    action: String,
    // The path of the current route
    url: String,
    // The path of the current route, the difference between path and subpath is: path is converted to an absolute path, subpath is equal to the original value
    path: String,
    // Full path, including path and query conditions
    fullPath: String,
    // Whether to strictly match location.pathname
    isExact: Boolean,
    // An array containing all nested route information that the current route accompanies
    matched: [
      route1,
      // route2:
      {
        // From the path in the route configuration, the difference between path and subpath is: path is converted to an absolute path, subpath is equal to the original value
        path: String,
        // From the path in the route configuration
        subpath: String,
        // The meta information in the route configuration
        meta: Object,
        // The meta information in the route configuration (computed)
        metaComputed: Object,
        // The state information of the route, you can update the state of the specified matchedRoute by calling `router.replaceState(state: State, matchedRoute?: MatchedRoute)`
        state: Object,
        // The redirect in the route configuration
        redirect: String|Object|Function,
        // The original route configuration object
        config,
        // The component instance that matches this route
        componentInstances: {
          default: React.Component,
          /* others: React.Component */
        }
        // The RouterView instance that matches this route
        viewInstances: {
          default: RouterView
        }
      }
      ..., 
      routeN
    ],
    // A key-value pair obtained by parsing the url
    params: Object,
    // A key-value pair obtained by parsing the query parameters after the url's ?. For example: /foo?user=1, then currentRoute.query.user == 1. If there are no query parameters, it is an empty object.
    query: Object,
    // The meta information of the current route, equivalent to matched[matched.length - 1].meta
    meta: Object,
    // The meta information in the route configuration (computed)
    metaComputed: Object,
    // The state information of the current route, equivalent to matched[matched.length - 1].state
    state: Object,
    // Indicates whether this route is redirected from another route
    redirectedFrom: Object,
    // The cancellation callback function from `router.push`, `router.replace`, `router.redirect` routes
    onAbort: Function,
    // The completion callback function from `router.push`, `router.replace`, `router.redirect` routes
    onComplete: Function,
  }
  ```


![Example](./images/route.png)

See: [Route Object Properties](https://router.vuejs.org/api/#route-object-properties)

### ReactViewRouter Instance Properties

- `id`  - Route instance id, a number used to identify the uniqueness of a route instance;

- `name` - Route instance name, when creating a route instance, you can pass a `name` parameter to give the route instance a name for easy identification;

- `currentRoute` - The current route information that matches the current url.

- `initialRoute` - The initial route object when the instance is created.

- `prevRoute` - The previous route information.

- `mode` - Route mode, values are: `hash`, `browser`, `memory`.

- `basename` - The route prefix of the current route instance, when not empty, it always ends with `/`;

- `basenameNoSlash` - The route prefix of the current route instance, when not empty, it never ends with `/`;

- `parent` - The parent route instance of the current route instance (if any);

- `top` - The top-level route instance of the current route instance, when equal to itself, it means that it is the top-level route instance;

- `children` - The list of child route instances of the current route instance;

- `viewRoot` - The root `RouterView` associated with the current route instance;

- `stacks: { index: number, pathname: string, search: string, timestamp: number }[]` - Route stack, which contains the route information that has been jumped through, you can view which routes have been jumped through on the current page through it, you can `forward/back` to this route through the `go` method, or get all the route configurations that match this route through `getMatched`. Example:

    ```js
    let stack = router.stacks.find(v => v.pathname.startsWith('/home'));
    if (stack) {
      let matched = router.getMatched(stack);
      // If it is the home page, go back to that page
      if (matched.some(r => r.meta.isHome)) router.go(stack);
    }
    ```

- `isRunning` - Whether the `router` instance is in running state, when it is `false`, it will not respond to route events;

- `isRunning` - Whether the `router` instance is in running state, when it is `false`, it will not respond to route events;

- `isPrepared` - Whether the current route is ready - `root route`, `currentRoute` has been generated;

- `isHistoryCreater` - Whether it is the creator of the internal `history`;

- `isBrowserMode` - Whether it is the `browser` route mode;

- `isHashMode` - Whether it is the `hash` route mode;

- `isMemoryMode` - Whether it is the `memory` route mode;

### ReactViewRouter Instance Methods

#### `beforeEach` [Global Before Guard](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards)

```js
const router = new ReactViewRouter({ ... })

router.beforeEach((to, from, next) => {
  // ...
})
```

When a navigation is triggered, the global before guard is called in the order of creation. The guard is asynchronously resolved and executed, and the navigation is in a waiting state until all guards are resolved.

Each guard method receives three parameters:

- `to: Route`: The target [route object](#ReactViewRouter-properties) that is about to enter

- `from: Route`: The current route that is about to leave
- `next: Function`: You must call this method to resolve this hook. The execution effect depends on the call parameter of the next method.

  - `next()`: Proceed to the next hook in the pipeline. If all hooks are executed, the navigation state is confirmed.

  - `next(false)`: Abort the current navigation. If the URL of the browser changes (may be due to user manual or browser back button), the URL address will be reset to the address corresponding to the from route.

  - `next('/')` or `next({ path: '/' })`: Jump to a different address. The current navigation is aborted, and then a new navigation is performed. You can pass any location object to next, and allow options such as `replace: true`.

  - `next(error)`: If the parameter passed to next is an Error instance, the navigation will be terminated and the error will be passed to the callback registered with `router.onError()`.

Make sure that the next function is strictly called once in any given navigation guard. It can appear more than once, but only when all logical paths do not overlap, otherwise the hook will never be resolved or an error will be reported.

** Here is an example of redirecting to /login when the user fails to authenticate:

```js
// BAD
router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !isAuthenticated) next({ name: 'Login' })
  // If the user fails to authenticate, `next` will be called twice
  next()
})
```

```js
// GOOD
router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !isAuthenticated) next({ path: '/login' })
  else next()
})
```

Note: In beforeEach, calling `router.push`, `router.replace`, `router.redirect`, etc. is equivalent to calling next. That is, the effects of the following 2 writings are the same:

```js
function checkLogin(next) {
  if (to.path !== '/login' && !isAuthenticated) {
    next({ path: '/login' });
    return false;
  }
  return true;
}

router.beforeEach((to, from, next) => {
  if (!checkLogin(next)) return;
  next()
})
```

```js
function checkLogin() {
  if (to.path !== '/login' && !isAuthenticated) {
    router.push({ path: '/login' });
    return false;
  }
  return true;
}

router.beforeEach((to, from, next) => {
  if (!checkLogin()) return;
  next()
})
```

#### `beforeResolve` [Global Resolve Guard](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-resolve-guards)

You can use router.beforeResolve to register a global guard. This is similar to router.beforeEach, but the difference is that `beforeResolve` is called after all component guards and asynchronous route components are resolved, but before the navigation is confirmed.

#### `afterEach` [Global After Hook](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-after-hooks)

You can also register global after hooks, but unlike guards, these hooks do not accept the next function and do not change the navigation itself:

```js
router.afterEach((to, from) => {
  // ...
})
```

#### `push`, `replace`, `go`, `back`, `forward` `redirect` [Programmatic Navigation](https://router.vuejs.org/guide/essentials/navigation.html)

The parameters of these methods can be a string path or an object describing the address. For example:
```js
// String, relative path
router.push('home')
// String, absolute path
router.push('/home')

// Object
router.replace({ path: '/home' })

// Jump from the previous route
router.push({ path: '../home' });

// With dynamic parameters
router.push({ path: '/user', params: { userId: '123' }})

// With query parameters, becomes /register?plan=private
router.push({ path: '/register', query: { plan: 'private' }})

// When the router's basename is not empty, if you want to ignore the basename when jumping, you can add an absolute parameter
router.push({ path: '/register', absolute: true, query: { plan: 'private' }})

// Jump by route name
router.push({ path: '[a-route-name]/register', })

// Return to the previous route
router.go(-1);

// Equivalent to router.replace, but the route object will have an additional flag isRedirect: true
router.redirect({ path: '/home' })

// Go back two steps first, then jump to the home route
router.push({ path: '/home', delta: -2 });

// Jump to an external address, equivalent to location.href = ''
router.push('http://www.baidu.com')
```

You can choose to provide `onComplete` and `onAbort` callbacks as the second and third parameters in `router.push` or `router.replace`. These callbacks will be called when the navigation is successfully completed (after all asynchronous hooks are resolved) or aborted (navigate to the same route, or navigate to another route before the current navigation is completed). The second and third parameters can be omitted, in which case if `Promise` is supported, `router.push` or `router.replace` will return a `Promise`.

The first parameter object format of `router.push`, `router.replace`, `router.redirect` supports the following parameters:
```ts
{
  // Adjusted path, can be a complete url, or a path starting with `/`, or a relative path like `./` or `../`
  path?: string,
  // Query parameters, the parameter part after the `?` in the url
  query?: Partial<any>,
  // When path is not a complete url, and does not start with `/`, `./`, `../`, path will be recognized as the last subpath of the current path to be replaced. When append is true, it means to append after the current path.
  append?: boolean,
  // When the router's basename is not empty, except for the complete url, the basename will be added before the final jump path. If you don't want the router to add, you can set absolute to true
  // absolute can also take the value 'hash' | 'browser' | 'memory', the router defaults to the same mode as the parent route, but when the router is in memory mode, it is unable to infer the mode of the sub route, you can set the parent route mode through absolute to facilitate the router to recognize the way to jump
  absolute?: boolean|string,
  // Indicates that before jumping to this path, first go forward/back `delta` steps in the route history and then jump
  delta?: number,
  // The reference route when the path is a relative path like `./` or `../`, in the ReactViewLike component, you can get it through this.$matchedRoute
  route?: ConfigRoute,
}
```

#### `parseQuery`, `stringifyQuery` 

Internal url query parsing/stringifying methods, can be overridden by `new ReactViewRouter({ parseQuery: parseQueryMethod, stringifyQuery: stringifyQueryMethod });`.

Note: The default parser will parse `true`, `false`, `null`, `undefined`, `JSON object/array` in the query of the query into the corresponding type, not string.

### `createRoute(to: string | object, options: { from?: object, action?: string, matchedProvider?: object })`

Transform the route information of type `string`, `{ path: string, query: {} }` into the same format as `router.currentRoute`, and the `matched` has been parsed, you can use it to get the route configuration information that matches this address.

### `nameToPath(name: string, options: { absolute?: boolean }|RouteHistoryLocation = {}) => string `

Convert a route name to the corresponding path, you can use this method to determine if a route name exists. `options.absolute` indicates whether it is an absolute path, if it is, it will also be searched from the parent route.

### `resolveRouteName(fn: RouteResolveNameFn) => () => void`

Register a route name resolution function, when `nameToPath` cannot find the corresponding route name from the route configuration, these resolution functions will be called to resolve. The return value is a callback function used to unregister this resolution function.

The function signature `RouteResolveNameFn` format is:
```ts
  (name: string, options: { absolute?: boolean }|RouteHistoryLocation, router: ReactViewRouter) => string|null|void
```
When the resolution function returns a value that is not `null` or `undefined`, it means that the corresponding path of the route name is found, and the return value will be returned as the path of the route name

- Note: If `options.absolute` is `true`, please handle its `basename` by yourself.

### `getMatched(to: string | object, from?: object, parent?: object)`

Get all route configurations that the route information of type `string`, `{ path: string, query: {} }` can match, you can do something with the information obtained from the matched route configuration. Here is an example of the application of this method in a practical scenario:

  ```js
    /**
     * Get the current menu path based on the route, for example: tax declaration >> declaration overview, used as the input parameter for online consultation
     * @param {Object} route Current route
     */
    getCurrentMenuPosition(route) {
      let position = '';
      route = route || router.currentRoute;
      if (!route.query.redirect) return position;
      const rs = router.getMatched(route.query.redirect).filter((r) => r.meta.title);
      if (rs.length) {
        position = rs.reduce((p, c) => {
          let title = c.meta.title;
          return (p ? `${p}>>${title}` : title);
        }, '');
      }
      return position;
    },
  ```

### `replaceState(newState: Partial<any>, matchedRoute?: MatchedRoute)`

Update the `state` of the current route (`currentRoute`) or the specified `matchedRoute`, so that when you go back from other pages to this route, you can get the state value set at that time through `router.currentRoute.state` or `router.currentRoute.matched[N].state`.

```js
import React, { useEffect } from 'react';
import router from '@/router';

function Test() {
  const setRouteState = () => {
    router.replaceState({ haha: 1, a: '1' });
  }

  useEffect(() => {
    console.log(router.currentRoute.state);
  }, []);

  return <div>
    <Button onClick={setRouteState}>Set State</Button>
  </div>;
}
```

### `replaceQuery(keyOrObj: string, value?: any)`

Update the specified parameter in the `query` of the current route (`currentRoute`). If the `router`'s `mode` is `browser|hash`, it will also update the corresponding parameter on the url;

```js
import React, { useEffect } from 'react';
import router from '@/router';

function Test() {
  const updateQueryTest = () => {
    router.replaceQuery('test', 1);
  }

  const updateQueryObj = () => {
    router.replaceQuery({
      test: 1,
      aaa: 2
    });
  }

  return <div>
    <Button onClick={updateQueryTest}>Update test in query</Button>
    <Button onClick={updateQueryObj}>Update multiple parameters in query</Button>
  </div>;
}
```

#### `plugin(plugin: ReactViewRoutePlugin): () => void`

Register a `ReactViewRouter` plugin, this plugin can be used to listen to various events in the route and do some processing. Such as:

```js
const uninstall = router.plugin({
  name: 'a-router-plugin',
  onRouteChange(route, router) {
    console.log('route changed', route);
  })
});

...sometimes...
uninstall();

```

Note: If the plugin name is the same, it will be recognized as the same plugin. When registering this plugin, the plugin with the same name will be uninstalled first, and then registered again.

The plugin supports the following methods:

```ts
type onRouteChangeEvent = (route: Route, prevRoute: Route, router: ReactViewRouter, prevRes?: any) => void;

type onRouteMetaChangeEvent = (newVal: any, oldVal: any, route: ConfigRoute, router: ReactViewRouter, prevRes?: any) => void;

interface ReactViewRoutePlugin {
  // Plugin name
  name: string;
  // Plugin installation method, will be called when `router.plugin()` method is called
  install?(router: any): void;
  // Plugin uninstallation method, will be called when the same name plugin is found when registering the plugin with `router.plugin()`, and then registered again. Or when the uninstall method returned by `router.plugin()` is called, the uninstall method will also be called
  uninstall?(router: any): void;

  // Called when the route listening is started
  onStart?(router: ReactViewRouter, routerOptions: ReactViewRouterOptions, isInit: boolean|undefined, prevRes?: any): void;
  // Called when the route listening is stopped
  onStop?(router: ReactViewRouter, isInit: boolean|undefined, prevRes?: any): void;

  // Triggered when router.routes changes (use set routes, call addRoutes to add routes), when routes === originRoutes, it means that new routes are added in the original routes;
  onRoutesChange?(
    routes: ConfigRouteArray,
    originRoutes: ConfigRouteArray,
    parent?: ConfigRoute|null,
    parentChildren?: ConfigRouteArray,
    prevRes?: any
  ): void;

  // Triggered when router.push, router.replace, router.redirect methods are called, you can interrupt the default route jump behavior in this event, and change to your own operation;
  onRouteGo?(
    to: RouteHistoryLocation,
    onComplete: (res: any, _to: Route|null) => void,
    onAbort: (res: any, _to: Route|null) => void,
    isReplace: boolean,
    prevRes?: any
  ): void|boolean;

  // Route enter guard event
  onRouteEnterNext?(route: MatchedRoute, ci: React.Component, prevRes?: any): void;
  // Route leave guard event
  onRouteLeaveNext?(route: MatchedRoute, ci: React.Component, prevRes?: any): void;
  // Called before and after the route changes, when the route is being parsed, and the judgment of whether the route can be jumped is in progress
  onRouteing?(next: (ok: boolean|onRouteingNextCallback|Route) => void, prevRes?: any): void;
  // Triggered when the route changes
  onRouteChange?: onRouteChangeEvent;
  // Triggered when the route meta changes
  onRouteMetaChange?: onRouteMetaChangeEvent;
  // Called when the real route component is obtained when parsing asynchronous route lazy loading
  onLazyResolveComponent?(
    nc: React.ComponentType|React.ForwardRefExoticComponent<any>,
    route: ConfigRoute,
    prevRes?: any
  ): React.ComponentType | undefined;
  // Called when registering routes in the router, called when the route is not in the routes for the first time when the router first traverses the routes
  onWalkRoute?(route: ConfigRoute, routeIndex: number, routes: ConfigRouteArray, prevRes?: any): void;

  onGetRouteComponentGurads?(
    interceptors: RouteGuardInterceptor[],
    route: ConfigRoute,
    component: any,
    componentKey: string,
    guardName: string,
     options: {
      router: ReactViewRouter,
      onBindInstance?: OnBindInstance,
      onGetLazyResovle?: OnGetLazyResovle,
      toResovle: RouteComponentToResolveFn,
      getGuard: (obj: any, guardName: string) => any,
      replaceInterceptors: (newInterceptors: any[], interceptors: RouteGuardInterceptor[], index: number) => any[]
    },
    prevRes?: any
  ): void|boolean;

  // Called when the route adjustment is aborted
  onRouteAbort?(to: Route, reason?: any, prevRes?: any): void;

  onViewContainer?(container: ReactViewContainer|undefined, options: {
    routes: MatchedRoute[],
    route: MatchedRoute,
    depth: number,
    router: ReactViewRouter,
    view: RouterViewComponent,
  }, prevRes?: ReactViewContainer): ReactViewContainer|void;
}

```
#### `install` The method of loading the `ReactVueLike` plugin. See: [ReactVueLike](https://github.com/gxlmyacc/react-vue-like)

```js
import vuelike from '@/vuelike';
import ReactViewRouter from 'react-view-router';

const router = new ReactViewRouter();

vuelike.use(router);
```


### Exported other methods
- `withRouteGuards` Guard method of route component:

```js
/**
 * Route component guard registration method
 * @param {Object} component - Route component
 * @param {Object} guards - Guard method
 * @param {Class} [componentClass] - If provided, routes will be treated as its child route configuration information
 * @return {RouteComponentGuards} - Route component that can be used as `React.forwardRef`
 **/
function withRouteGuards(component, guards = {}, componentClass?) {}
```

Example：

```js
import React from 'react';
import { RouterView, withRouteGuards } from 'react-view-router';

function HomeIndex() {
  return (
    <div>
      <h1>HomeIndex</h1>
      <RouterView />
    </div>
  );
}

export default withRouteGuards(HomeIndex, {
  beforeRouteEnter(to, from, next) {
    console.log('HomeIndex beforeRouteEnter', to, from);
    next();
  },
  beforeRouteLeave(to, from, next) {
    // confirm leave prompt
    console.log('HomeIndex beforeRouteLeave', this, to, from);
    next();
  },
  beforeRouteUpdate(to, from) {
    console.log('HomeIndex beforeRouteUpdate', to, from);
  },
  beforeRouteResolve(to, from) {
    console.log('HomeIndex beforeRouteResolve', to, from);
  },
  afterRouteLeave(to, from) {
    console.log('HomeIndex afterRouteLeave', to, from);
  },
});
```

- `lazyImport` Route component lazy loading method:
```ts
type LazyImportMethod<P = any> = (route: ConfigRoute, key: string, router: ReactViewRouter, options: Partial<any>) => P | Promise<P>;

/**
 * Route component lazy loading method
 * @param {LazyImportMethod} importMethod - webpack's import lazy loading method, Example: () => import('@/components/some-component')
 * @return {RouteLazy} - The return value can be used as the component/components value in the route configuration to achieve lazy loading
 **/
function lazyImport(importMethod: LazyImportMethod, options?: Partial<any>): RouteLazy;
```

- `normalizeRoutes` Normalize route configuration:
```ts
/**
 * Normalize route configuration
 * @param {UserConfigRoute[]} routes - Route configuration to be normalized
 * @param {ConfigRoute} [parent] - If provided, routes will be treated as its child route configuration information
 * @return {ConfigRouteArray} - Normalized route configuration
 **/
function normalizeRoutes(routes: UserConfigRoute[], parent?: ConfigRoute): ConfigRouteArray;
```
- `normalizeLocation` Normalize the route string or object to a unified format route object:
```javascript
/**
 * Normalize the route string or object to a unified format route object
 * @param {Object|string} to - Address object to be normalized
 * @param {Object} [options] - Other options
 * @param {Object} [options.route] The parent route of the address object, if provided, the relative path in the route will be resolved based on it
 * @return {Object} - Normalized route object: { path: string, pathname: string, search: string, query: Object, ...custom props } 
 **/
function normalizeLocation(to, options: { route? } = {}) {}
```

- `isLocation` Determine if `v` is a route object
```javascript
/**
 * Determine if `v` is a route object
 * @param {Object} v - Object to be determined
 * @return {boolean}
 **/
function isLocation(v) {}
```

- `matchPath` Just re-export, see: [matchPath](https://reacttraining.com/react-router/web/api/matchPath)


- `createRouterLink` - Create a `router-link` component based on a `router`. You can create this component while creating the `router`:

    ```js
    import ReactViewRouter, { createRouterLink } from 'react-view-router';

    const router = new ReactViewRouter();
      
    const RouterLink = createRouterLink(router);

    export {
      RouterLink
    }

    export default router;
    ```

- `createRouteGuardsRef` Create a route guard reference

  This method is used when the user does not want to use `useRouteGuardsRef`, but wants to create a compatible instance equivalent to `useRouteGuardsRef` directly using `useImperativeHandle`.

  Example:
  ```js
  import React, { useImperativeHandle } from 'react';
  import { createRouteGuardsRef } from 'react-view-router';
  import modals from '~/utils/modals';

  const Test = React.forwardRef((props, ref) => {
    const inputRef = useRef();

    useRouteGuardsRef(
      ref, 
      () => createRouteGuardsRef({
        async beforeRouteLeave(to, from, next) {
          console.log('Test beforeRouteLeave', to, from);
          try {
            await modals.confirm({ content: 'Are you sure you want to leave?' });
            next();
          } catch (ex) {
            next(false);
          }
        },
        beforeRouteUpdate(to, from) {
          console.log('Test beforeRouteUpdate', to, from);
        },

        focus: () => {
          inputRef.current.focus();
        },
      })
    );

    return (
      return <input ref={inputRef} ... />;
    );
  });

  export default Test;
  ```

- `readRouteMeta` Read a value of `meta` in ConfigRoute, when the value is a function, it will be treated as
  ```ts 
  function (route: ConfigRoute, routes: ConfigRoute[], props: Partial<any>): any
  ```
callback and return its return value;

  ```javascript
  /**
   * @param {ConfigRoute} route - ConfigRoute to read meta
   * @param {string} key - Parameter name to read meta
   * @param {props: Partial<any>} props - Will be passed as the third parameter to the value function of meta
   * @return {any}
   **/
  function readRouteMeta(route: ConfigRoute, key: string = '', props: {
    router?: ReactViewRouter|null,
    [key: string]: any
  } = {}): any
  ```

## HOCS/HOOKS

`react-view-router` also supports HOC/HOOKS

### HOCS

### withRouter

Get the router instance, the function signature is as follows:

```javascript
/**
 * @param {React.ComponentType} Comp - The component to be wrapped 
 * @param {object} [options] - Options 
 * @param {boolean} [options.withRoute] - Whether to also get the current route object
 * @return {React.ComponentType}
 **/
const withRouter = (Comp: React.ComponentType, { withRoute: boolean = false }) => React.ComponentType
```

### withRoute

Get the route object, the function signature is as follows:

```javascript
/**
 * @param {React.ComponentType} Comp - The component to be wrapped 
 * @param {object} [options] - Options 
 * @param {boolean} [options.withRouter] - Whether to also get the current router instance
 * @return {React.ComponentType}
 **/
const withRoute = (Comp: React.ComponentType, { withRouter: boolean = false }) => React.ComponentType
```

### withMatchedRoute

Get the matchedRoute object of the current level, the function signature is as follows:

```javascript
/**
 * @param {React.ComponentType} Comp - The component to be wrapped 
 * @param {object} [options] - Options 
 * @param {boolean} [options.withMatchedRouteIndex] - Whether to also get the current level index
 * @return {React.ComponentType}
 **/
const withMatchedRoute = (Comp: React.ComponentType, { withMatchedRouteIndex: boolean = false }) => React.ComponentType
```

### withMatchedRouteIndex

Get the current level index, the function signature is as follows:

```javascript
/**
 * @param {React.ComponentType} Comp - The component to be wrapped 
 * @param {object} [options] - Options 
 * @param {boolean} [options.withMatchedRoute] - Whether to also get the matchedRoute object of the current level
 * @return {React.ComponentType}
 **/
const withMatchedRouteIndex = (Comp: React.ComponentType, { withMatchedRoute: boolean = false }) => React.ComponentType
```

### withRouterView

Get the RouteView instance of the current level, the function signature is as follows:

```javascript
/**
 * @param {React.ComponentType} Comp - The component to be wrapped 
 * @param {object} [options] - Options
 * @return {React.ComponentType}
 **/
const withRouterView = (Comp: React.ComponentType, {}) => React.ComponentType
```

### HOOKS

### useRouter

Get the router instance, the function signature is as follows:

```javascript
/**
 * @return {ReactViewRouter|null}
 **/
const useRouter = (defaultRouter?: ReactViewRouter|null) => ReactViewRouter|null
```

### useRoute

Get the route object, the function signature is as follows:

```javascript
/**
 * @param {ReactViewRouter} [defaultRouter] The default route management component, when not passed, it will be found according to the context
 * @param {object} [options]  Matching options
 * @param {boolean} [options.watch]  Whether to monitor route changes
 * @param {number|boolean = false} [options.delay]  Whether to asynchronously notify route changes when the route changes
 * @param {boolean = true} [options.ignoreSamePath]  If the route fullPath before and after the route changes is the same, the component will not be re-rendered
 * @return {Route}
 **/
const useRoute = (
  defaultRouter?: ReactViewRouter|null, 
  options?: { 
    watch?: boolean,
    delay?: boolean|number,
    ignoreSamePath?: boolean
  }
) => Route
```

### useRouteMeta

Get the route meta information of the current route level, you can read the information in it and modify it.

```javascript
/**
 * @return {Route}
 **/
const useRouteMeta = (key: string|string[]): [Partial<any>, (key: string|string[], value: any) => void]
```

Example:
```js
import { useRouteMeta } from 'react-view-router';

function Test() {
  const [title, setTitle] = useRouteMeta('title');

  return <>
    <button
      onClick={() => setTitle('Title has been modified')}
    >Modify title</button>
    <div>{title}</div>
  </>
}
```

### useRouteMetaChanged

Register a route meta information change event, this method is quite useful in components that generate data through route meta information

```javascript
/**
 * @return {Route}
 **/
const useRouteMetaChanged = (router: ReactViewRouter, onChange: onRouteMetaChangeEvent, depMetaKeys: string[] = [])
```

Example:
```js
import React, { useState } from 'react';
import { useRouter, useMatchedRoute, useRouteMetaChanged } from 'react-view-router';

function Test() {
  const router = useRouter();
  const matchedRoute = useMatchedRoute();
  const [title, setTitle] = useRouteMeta('title');
  
  useRouteMetaChanged(router, (newVal, oldVal, route) => {
    console.log('title changed');
  }, ['title']);

  return <>
    <button
      onClick={() => setRouteMeta('title', 'Title has been modified')}
    >Modify title</button>
    <div>{title}</div>
  </>
}
```

### useMatchedRoute

Get the matchedRoute object of the current level, the function signature is as follows:

```javascript
/**
 * @param {ReactViewRouter} [defaultRouter] The default route management component, when not passed, it will be found according to the context
 * @param {object} [options]  Matching options
 * @param {number = 0} [options.matchedOffset]  The offset of the matched matchedRoute (forward)
 * @param {string} [commonPageName] The meta name of the common route, if commonPageName is not empty and the attribute value of this name in the meta of currentRoute is true, and currentRoute.query.redirect is not empty, the matchedRoute will be parsed from currentRoute.query.redirect
 * @param {boolean = true} [options.watch]  Whether to monitor route changes
 * @param {number|boolean = false} [options.delay]  Whether to asynchronously notify route changes when the route changes
 * @param {boolean = true} [options.ignoreSamePath]  If the route fullPath before and after the route changes is the same, the component will not be re-rendered
 * @return {MatchRoute}
 **/
const useMatchedRoute = (
  defaultRouter?: ReactViewRouter|null, 
  options?: { 
    matchedOffset?: number, 
    watch?: boolean,
    delay?: boolean|number,
    ignoreSamePath?: boolean 
  }
) => MatchedRoute
```
### useMatchedRouteIndex

Gets the index of the current level, the function signature is as follows:

```javascript
/**
 * @param {ReactViewRouter} [defaultRouter] The default route management component, when not passed, it will be found according to the context
 * @param {number} [matchedOffset] The offset of the matched matchedRoute (forward), default value is 0
 * @return {number}
 **/
const useMatchedRouteIndex = (matchedOffset?: number = 0) => number
```

### useRouterView

Gets the RouteView instance of the current level, the function signature is as follows:

```javascript
/**
 * @return {RouterView}
 **/
const useRouterView = () => RouterView
```

### useRouteGuardsRef

This method wraps the `useImperativeHandle` hooks, you can register route guards through this method.

```javascript
/**
 * @param {Ref} ref The ref obtained through React.forwardRef
 * @param {T|(() => T)} guards The route guard object, supports beforeRouteLeave, beforeRouteResolve, afterRouteLeave, beforeRouteUpdate guards
 * @param {DependencyList} deps The deps passed to useImperativeHandle
 * @return {void} 
 **/
function useRouteGuardsRef<T extends RouteGuardsInfo>(
  ref: Ref<T>|undefined,
  guards: T|(() => T),
  deps: DependencyList = []
): void
```

Example:

```js
import React from 'react';
import { useRouteGuardsRef } from 'react-view-router';
import modals from '~/utils/modals';

const Test = React.forwardRef((props, ref) => {
  useRouteGuardsRef(ref, {
    async beforeRouteLeave(to, from, next) {
      console.log('Test beforeRouteLeave', to, from);
      try {
        await modals.confirm({ content: 'Are you sure you want to leave?' });
        next();
      } catch (ex) {
        next(false);
      }
    },
    beforeRouteUpdate(to, from) {
      console.log('Test beforeRouteUpdate', to, from);
    },
  });

  return (
    <div className="">
      something
    </div>
  );
});

export default Test;

```

Note: Do not mix `useRouteGuardsRef` and `useImperativeHandle` in a functional component.

### useRouteChanged

Registers a route change callback event for the specified `router`, the function signature is as follows:

```ts
/**
 * @return {RouterView}
 **/
const useRouteChanged = (router: ReactViewRouter, onChange: onRouteChangeEvent) => void
```
Example:

```js
import { useRouter, useRouteChanged } from 'react-view-router';

const router = useRouter();
useRouteChanged(router, (route) => {
  const path = route.matched[0] && route.matched[0].subpath;
  if (path !== activeTab && tabs.some((tab) => tab.key === path)) {
    setActiveTab(path);
  }
});
```

### useViewActivate

When the current route component has enabled keepAlive and will trigger an activation event when re-entering;

```ts
interface KeepAliveEventObject {
  type: keyof RouterViewEvents,
  router: ReactViewRouter,
  source: RouterView,
  target: MatchedRoute,
  to: MatchedRoute|null,
  from: MatchedRoute|null,
}

type KeepAliveChangeEvent = (event: KeepAliveEventObject) => void;
/**
 * @return {RouterView}
 **/
const useViewActivate = (onEvent: KeepAliveChangeEvent) => void
```
Example:

```js
import { useViewActivate } from 'react-view-router';

useViewActivate((event) => {
  // dosomethine
});
```

### useViewDeactivate

When the current route component has enabled keepAlive and will trigger a deactivation event when leaving the current route;

```ts
interface KeepAliveEventObject {
  type: keyof RouterViewEvents,
  router: ReactViewRouter,
  source: RouterView,
  target: MatchedRoute,
  to: MatchedRoute|null,
  from: MatchedRoute|null,
}

type KeepAliveChangeEvent = (event: KeepAliveEventObject) => void;
/**
 * @return {RouterView}
 **/
const useViewDeactivate = (onEvent: KeepAliveChangeEvent) => void
```
Example:

```js
import { useViewDeactivate } from 'react-view-router';

useViewDeactivate((event) => {
  // dosomethine
});
```

### useRouteTitle

Iterates through the route configuration to find the information filtered out by `meta.title` and `meta.visible` in the route configuration of the current level, where `meta.title` and `meta.visible` can be a function. You can use this information to create menus, tabs, etc. The function signature is as follows:

```ts
// `meta.title` and `meta.visible` can be boolean values, or functions like this
type RouteMetaFunction<T = boolean> = (route: ConfigRoute, routes: ConfigRouteArray, props: {
  router?: ReactViewRouter|null,
  level?: number,
  maxLevel?: number,
  refresh?: () => void
  [key:string]: any
}) => T;

type RouteTitleInfo = {
  title: string;
  path: string;
  meta: Partial<any>;
  route: ConfigRoute;
  children?: RouteTitleInfo[];
};

type filterCallback = (r: ConfigRoute, routes: ConfigRouteArray, props: {
  router: ReactViewRouter
  level: number,
  maxLevel: number,
  refresh: () => void,
  title?: string,
  visible?: boolean
}) => boolean;

type RouteTitleProps = {
  // The maximum search level of useRouteTitle
  maxLevel?: number,
  // Custom filtering for the filtered title information
  filter?: filterCallback,
  // Specify the meta parameter name in ConfigRoute that the filter depends on, so that they can trigger updates when they are updated
  filterMetas?: string[],
  /**
   * Whether it is manual mode, when true, the first time useRouteTitle is called, it will not actively search for ConfigRoute, until you call refreshTitles once,
   * You can implement an asynchronous display of menus, tabs, etc. through this parameter
   **/
  manual?: boolean,
  // The offset of the matched matchedRoute (forward), default value is 0
  matchedOffset?: number;
  // The key value of the common page meta, default is 'commonPage'. That is, when a matched route's meta contains commonPage: true and router.currentRoute.query.redirect is not empty, the parsing of titles will be re-parsed from router.currentRoute.query.redirect
  commonPageName?: string;
}

type RouteTitleResult = {
  titles: RouteTitleInfo[];
  setTitles: (titles: RouteTitleInfo[]) => void;

  currentPaths: string[];
  setCurrentPaths: (currentPaths: string[]) => void;

  refreshTitles: () => void;
}

/**
 * @param {RouteTitleProps} props Parameters
 * @param {ReactViewRouter} defaultRouter The default route instance
 * @param {DependencyList} deps The deps passed to useRouteTitle
 * @return {RouteTitleResult} 
 **/
function useRouteTitle(
  props: RouteTitleProps = {},
  defaultRouter?: ReactViewRouter,
  deps: any[] = []
): RouteTitleResult;
```
Left menu example:

```js
import React, { useMemo, useEffect } from 'react';
import {
 useRouter, useRouteTitle,
} from 'react-view-router';
import { observer } from 'mobx-react';
import { LeftMenu } from '@/ui';
import store from '@/store';

const MainLeft = observer(() => {
  const { companyId } = store.state.company;

  const router = useRouter();
  const {
    titles,
    currentPaths: currentMenus,
    refreshTitles,
  } = useRouteTitle({ 
    // Start searching for matching titles from the level below the current component
    maxLevel: 2 
  });

  const menus = useMemo(() => {
    const getMenus = (list = []) => list.map((item) => {
      const { title, meta, path } = item;
      return {
        text: title,
        key: path,
        icon: meta.icon ? <i className={`iconfont ${meta.icon}`} /> : null,
        children: getMenus(item.children),
      };
    });
    return getMenus(titles);
  }, [titles]);

  useEffect(() => {
    if (titles.length) refreshTitles();
  }, [companyId]);

  const parentPaths = currentPaths.length > 1
    ? currentPaths.slice(0, currentPaths.length - 1)
    : currentPaths;
  const currentPath = currentPaths.length ? currentPaths[currentPaths.length - 1] : null;

  return (
    <LeftMenu
      onlyOpenCurrent
      defaultLock
      height="100%"
      data={menus}
      openKeys={parentPaths}
      selectedKeys={currentPath ? [currentPath] : null}
      onSelect={(path) => router.push(path)}
    />
  );
});

export default MainLeft;
```

Tab Bar Example:

```js
import React from 'react';
import router from '@/history';
import { useRouter, RouterView, useRouteTitle } from 'react-view-router';
import { Tabs } from '@/ui';

const { TabPane } = Tabs;

function MainHeader(props) {
  const router = useRouter();
  const {
    titles,
    currentPaths: [currentPath],
  } = useRouteTitle({ maxLevel: 1 }, router);

  return (
    <div>
      <Tabs
        activeKey={currentPath}
        onChange={(path) => router.replace(path)}
      >
      {
        titles.map((tab) => (
          <TabPane
            tab={tab.title}
            key={tab.path}
          />
        ))
      }
      </Tabs>
      <RouterView />
   </div>
  );
}

export default MainHeader;
```
## ReactViewLike Integration

`react-view-router` can be used as a plugin for `ReactVueLike`:

```js
import vuelike from '@/vuelike';
import ReactViewRouter from 'react-view-router';

const router = new ReactViewRouter({
  basename: '',     // app's basename, if the page route is under /app/, then the base value should be "/app/"
  mode: 'hash', // route type browser|memory|hash, default:hash
  routes: []    // route configuration array, can also use the router.use method to initialize
});
   
vuelike.use(router);
```
This way, `router` can be registered as a plugin for `ReactVueLike`. After registration, the following features will be available:


### Component-level Route Events

```js
import React from 'react';
import ReactVueLike from 'react-vue-like';

class EmployeeManager extends ReactVueLike.Component {

  beforeRouteEnter(to, from, next) {
    next();
  }

  beforeRouteLeave(to, from, next) {
    next();
  }

  beforeRouteResolve(to, from) {

  }

  afterRouteLeave(to, from) {

  }

  beforeRouteUpdate(to, from) {

  }
 
  render() {
    return (
      <div className="employee-manager">  
      </div>
    );
  }
}

export default EmployeeManager;
```


### Injected Objects

In the `ReactVueLike.Component` component instance, you can get:

- `$router` - the current router management instance
- `$route` - object, the current route information, equivalent to `router.currentRoute`
- `$matchedRoute` object, the current matched sub-route information
- `$routeIndex` number, the index of the current matched sub-route

The relationship between the three is: `$route.matched[$routeIndex] === $matchedRoute`.

Below is an example of "reading tab label information from route metadata and rendering":
```js
import React from 'react';
import ReactVueLike from 'react-vue-like';

class EmployeeManager extends ReactVueLike.Component {

  static computed = {
    active() {
      const matched = this.$route.query.redirect
        ? this.$router.getMatched(this.$route.query.redirect)
        : this.$route.matched;
      const match = matched[this.$routeIndex + 1];
      return (match && match.subpath) || 'roster';
    },
    tabs() {
      return this.$matchedRoute.config.children
        ? this.$matchedRoute.config.children.filter((r) => r.meta.title && !r.meta.hideTab).map((r) => ({
          key: r.subpath,
          label: r.meta.title,
          badge: Boolean(r.meta.badge)
        }))
        : [];
    },
  }

  handleTabChanged(v) {
    const path = `${this.$matchedRoute.path}/${v}`;
    if (this.$route.path === path) return;
    this.$router.replace(path);
  }

  render() {
    return (
      <div className="employee-manager">
        <ui-tabs activeKey={this.active} onChange={this.handleTabChanged}>
          { this.tabs.map((tab) => <ui-tabs-tab-pane tab={tab.label} key={tab.key} />)}
        </ui-tabs>
      </div>
    );
  }
}

export default EmployeeManager;
```
### Listen to Route Changes

You can use the `watch` feature of `ReactVueLike.Component` to listen to route changes and do something.

Example:

```js
import React from 'react';
import ReactVueLike from 'react-vue-like';

class MainSider extends ReactVueLike.Component {

  static watch = {
    $route(newVal, oldVal) {
      if (!newVal || !oldVal) return;
      // When the route changes, update the left menu information
      if (newVal.fullPath !== oldVal.fullPath) this.updateList(newVal);
    },
  }

  static methods = {
    updateList(route) {
      ...
    },
  }
}

export default MainSider;
```

## Route Transition Effects

You can use `import RouterView from 'react-view-router/transition'` to reference `RouterView` that supports route transition effects to add simple transition effects to the page. Currently, three types of effects are supported: `fade|slide|carousel`:

```js
import React from 'react';
// import { RouterView } from 'react-view-router';
import RouterView from 'react-view-router/transition';
import router from '@/history';

function  App() {
  return (
    <div className="app-index">
      <RouterView
        router={router}
        transition="slide"
        // transitionPrefix="react-view-router-"
        // transitionZIndex={1000}
      />
    </div>
  );
}

export default App;
```

The usage is the same as the regular `RouterView`, except that four additional properties are added: `transition`, `transitionPrefix`, `transitionZIndex`, `routerView`:
```ts
interface TransitionRouterViewProps extends RouterViewProps {
  transition?: TransitionName | {
    name: TransitionName,
    zIndex?: number,
    containerStyle?: React.HTMLAttributes<HTMLDivElement>,
    containerTag?: string | React.ComponentType | React.ForwardRefExoticComponent<any>
  };
  transitionPrefix?: string;
  transitionZIndex?: number;
  routerView?: RouterViewComponent
}
```

- `transition` - The name of the effect, currently supports `slide` and `fade` effects. It can also be an object.
- `transitionPrefix` - The `className` prefix of the effect, default is `react-view-router-`. If you modify this value, you need to provide the style of the effect by yourself;
- `transitionZIndex` - The `zIndex` of the entering/leaving page, default is 1000. If the current effect is `slide` and there is an element in the current page with a zIndex greater than 1000, you can avoid the element penetrating the transition page by setting `transitionZIndex` to a higher value.

## Route Handling in Mid-end Modules

If a mid-end module needs to configure routes, it needs to add its routes to the route address of the host project, and `react-view-router` also supports this mode of development.

1. Configure the route instance to manual mode:

```js
import ReactViewRouter from 'react-view-router';
import routes from './routes';

const router = new ReactViewRouter({
  manual: true,
  routes
});

export default router;
```

2. Start route monitoring when the module is initialized/destroyed

```js
import router from '@/history';

export default {
  bootstrap({ basename, routeMode }) {
    ...
    router.start({ basename, routeMode });
    ...
  },

  unmount() {
    ...
    router.stop();
    ...
  }
}
```
Or in the component:

```js
import React from 'react';
import { useManualRouter, RouterView } from 'react-view-router';
import router from '@/history';

/** 
 * Global route interception event
 * @type {import('react-view-router').RouteBeforeGuardFn} 
 **/
function beforeEach(to, from, next) {
  next();
}

function App({ basename, routeMode }) {
  useManualRouter(router, { basename, routeMode });

  return <div>
    <RouterView router={router} beforeEach={beforeEach} />
  </div>
}

export default App;
```
## NOTE

1. `react-view-router` does not depend on `react-vue-like` and can be used independently.

2. If the route component is a `Class Component` (not a `Function Component`), then the guard functions of the `beforeRouteUpdate`, `beforeRouteLeave`, `afterRouteLeave` components will all be bound to the `this` variable, which points to the current component instance;
