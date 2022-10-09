# react-view-router

一个路由配置化的路由管理组件，支持各种路由事件拦截、重定向操作。
 

## 安装

```bash
npm install react-view-router --save
# or
yarn add react-view-router
```

## 基本用法

### 示例

```javascript
/// router.js
import ReactViewRouter from 'react-view-router';
import routes from './routes';
const router = new ReactViewRouter({
  basename: '',     // app的basename,若页面路由是在/app/下面，则base的值应该为"/app/"
  mode: 'hash',    // 路由类型 browser|memory|hash, default:hash
  routes: routes   // 路由配置数组，也可以使用router.use方法来初始化
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
    // 子路由
    children: [
      // 路径重定向
      { path: '/', redirect: 'main' },
      // 默认(索引)路径
      // { path: '/', index: 'main' },
      {
        path: 'main',
        // 懒加载
        component: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main')),
        // 路由元信息
        meta: { needLogin: true },
        children: [
          // 重定向
          { path: '/', redirect: to => ({ path: 'some', query: { aa: 1, bb: 2 } }) },
          {
            path: 'some',
            components: {
              default: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some')),
              footer: lazyImport(() => import(/* webpackChunkName: "home" */ './home/main/some/footer.js')),
            }
            // 路由守卫:
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

  const filter = routes => routes.filter(r => !r.meta.hide);

  return (
    <div>
      <h1>App</h1>
      {
        // 跟RouterView需要router参数 
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
[命名视图](https://router.vuejs.org/zh/guide/essentials/named-views.html#嵌套命名视图)

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
    // 可以在这里确认是否离开
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

### Route 配置选项
- `name` 路由名称，相当于别名，路由名称在一个router的所有路由配置中应该唯一，可以通过它调整路由，如：`router.push('[aRouteName]/somepath')`，`name`中可以有以下字符：`A-z.\-_#@$%^&*():|?<>=+`
- `path` URL字符串。
- `component` 路由对应的组件。
- `components` 路由对应的组件，可用于`命名RouterView`，`component`对应于`components.default`。
- `exact` 是否严格匹配`location.pathname`。
- `redirect` 路由将会重定向到一个新地址，可以是字符串、对象或函数。
- `index` 默认路由名称，可以是字符串或函数。
- `children` 嵌套的子路由配置信息。
- `meta` 路由的自定义元信息, 参见: [路由元信息](https://router.vuejs.org/zh/guide/advanced/meta.html)。
- `metaComputed` 路由配置中的meta信息(已完成计算)。当meta中某个值为函数时，则将会将其当做`RouteMetaFunction`函数执行结果当做值。
- `defaultProps` 值为对象，格式： `{ aa: 1, bb: '2', cc: true }`, 渲染路由组件时添加额外的pros参数。
- `props` boolean或对象，格式： `{ aa: Number, bb: String, cc: Boolean }`, 将路由的params参数中指定的属性当做props传递给路由组件，是下面的`paramsProps`的别名。
- `paramsProps` boolean或对象，格式： `{ aa: Number, bb: String, cc: Boolean }`, 将路由的params参数中指定的属性当做props传递给路由组件。
- `queryProps` boolean或对象，格式：`{ aa: Number, bb: String, cc: Boolean }`, 将路由的query参数中指定的属性当做props传递给路由组件。
- `guards` 路由守卫, 指`beforeEnter`、`beforeLeave`、`beforeUpdate`、`afterLeave`，参见:[Per-Route Guard](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#全局前置守卫)
- `isComplete` boolean，路由是否完成拦截处理。在路由跳转过程中，经常需要重定向处理，对于最终未完成跳转的路由对象`Route`的`isComplete`将为`false`。

### RouterView的Props

- `name` 用于`命名视图`, 参见[vue-router说明](https://router.vuejs.org/zh/guide/essentials/named-views.html#嵌套命名视图)
- `filter` 函数: `function (routes: Array) { return [] }`，可以用它过滤匹配的路由
- `fallback` 可以是一个函数：`function ({ parentRoute, currentRoute, inited, resolving, depth }) { return <div /> }`, 或者`React Component Element`，比如：`<Loading>loading</Loading>` 

### RouterLink的Props

`RouterLink`组件是一个类似`react-router`中的`Link`组件，它可以实现路由调整，以及根据是否匹配当前路由从而高亮自己。

使用示例：

```js
import React from 'react';
import { RouterLink } from 'react-view-router';

export default function HomeIndex() {
  return (
    <div>
      <RouterLink tag="a" to={{ path: '/login' }}>登录</RouterLink>
      <RouterLink tag="a" to="/admin" replace>设置</RouterLink>
    </div>
  );
}
```

#### router: ReactViewRouter

`RouterLink`关联的`ReactViewRouter`实例，当`RouterLink`在跟`RouterView`同级或之上时，该属性为必须；否则`RouterLink`给根据React组件层级关系自动寻找关联的`ReactViewRouter`实例。

#### to: RouteLocation|string
  
表示目标路由的链接。当被点击后，内部会立刻把`to`的值传到`router.push()`或`router.replace()`，所以这个值可以是一个字符串或者是描述目标位置的对象。对象格式为：

```ts
{
  // 跳转路由地址
  path?: string,
  // 查询参数
  query?: Partial<any>,
  // 动态参数
  params?: Partial<any>,
  // 是否在当前路由上追加
  append?: boolean,
  // 是否是绝对地址
  absolute?: boolean | 'hash' | 'browser' | 'memory',
  // 跳转前的回退步数，整数表示前进，负数表示后退
  delta?: number,
  // 如果要跳转的路由在历史路由栈中已经有时，则进行回退，而不是push/replace，该参数跳转了一系列路由后会首页，又不想产生新的路由历史时会比较有用
  backIfVisited?: boolean,
  // 如果该参数为true，则在调用`push`、`replace`方法时，如果当前`router`未完成准备(`!router.isPrepared`)并且处在拦截器处理中（`beforeEach`、`beforeRouterEnter`、`beforeRouterLeave`）时则不会解决拦截器的处理，而是改为设置`pendingRoute`；
  pendingIfNotPrepared?: boolean,
}
```

#### replace: boolean
  
设置`replace`属性的话，当点击时，会调用`router.replace()`而不是`router.push()`，于是导航后不会留下`history`记录。

#### append：boolean
  
设置`append`属性后，则在当前 (相对) 路径前添加基路径。例如，我们从`/a`导航到一个相对路径`b`，如果没有配置`append`，则路径为`/b`，如果配了，则为`/a/b`。该属性和跳转对象中的`append`等效


#### tag: string|React.ElementType

有时候想要`RouterLink`渲染成某种标签，例如`<li>`。 于是我们使用`tag`属性指定何种标签，同样它还是会监听点击，触发导航。

#### activeClass: string = 'router-link-active'

`RouterLink`匹配当前路由激活时添加的class类名；

#### exact: boolean

是否精确匹配时才激活`RouterLink`组件。“是否激活”默认类名的依据是包含匹配。 举个例子，如果当前的路径是`/a`开头的，那么`RouterLink`也会被设置`CSS`类名。按照这个规则，每个路由都会激活`<RouterLink to="/" />`！想要链接使用“精确匹配模式”，则使用`exact`属性：

#### exactActiveClass: string = 'exact-active-class'

配置当链接被精确匹配的时候应该激活的`class`。

#### event: 'click'|'mouse-enter'|'mouse-leave'等React支持的组件事件名 = 'click'

配置触发跳转事件的事件名，可以是任意React支持的组件事件。

#### onRouteChange: (route: Route) => void
  
路由发生变更时的事件

#### onRouteActive: (route: Route) => void
  
当`RouterLink`组件匹配当前路由时触发

#### onRouteInactive: (route: Route) => void
  
当`RouterLink`组件从匹配状态变为非匹配状态时触发


### ReactViewRouter的options选项

  `options`选项用在创建`ReactViewRouter`实例中，或者`use`、`start`方法参数上。它支持下面几个参数：

  - `name: string` 你可以为该`ReactViewRouter`提供一个名称，方便识别

  - `basename: string` 该路径组件的基路径

  - `mode: 'hash'|'memory'|'browser'|History` - 路由模式

  - `hashType: 'slash'|'noslash'` 当`mode`为`hash`时，配置`hash`路径是否以`/`开头

  - `pathname: string` - 在`memory`路由模式时使用，用于指定`memory`路由的初始路由地址

  - `history: History` - `ReactViewRouter`的`history`对象，不传时`ReactViewRouter`将内部创建它，该属性一般用在路由为`memory`模式，通过将其的`router.history`传递给子应用的 `ReactViewRouter`, 这样子应用的`memory`路由可以实现和父应用的`memory`路由联动。

  - `routes: ConfigRoute[]` - 所有的路由配置列表

  - `queryProps: { [key: string]: (val: string) => any; }` url参数类型转换对象

  - `manual: boolean` 是否手动模式，表示在`new ReactViewRouter()`时不自动调用`start`方法。这时需要你手动调用`start`方法来启用路由监听后，`ReactViewRouter`实例才真正开始工作

  - `rememberInitialRoute: boolean` 是否记住`initialRoute`。当为`true`时，在刷新浏览器页面时，`initialRoute`不再是记录的当前url中的路由信息，而是从sessionStroage中检索到的第一次的路由信息。该功能主要是为了解决刷新页面导致初始化url参数丢失的问题

### ReactViewRouter属性
- `currentRoute` 当前匹配的路由信息:
```javascript
{
  // 当前路由的操作类型，有:POP、PUSH、REPLACE
  action: String,
  // 当前路由的路径
  url: String,
  // 当前路由的路径，和url的区别是path可能是：/home/dd/:id这种，url会将id转换为具体数值
  path: String,
  // 全路径，包括路径和查询条件
  fullPath: String,
  // 是否严格匹配location.pathname
  isExact: Boolean,
  // 一个数组，包含当前路由陪陪的所有嵌套路由信息
  matched: [
    route1,
    // route2:
    {
      // 来自路由配置中的path，和subpath的区别是：path转换为了绝对路径，subpath等于原值
      path: String,
      // 来自路由配置中的path
      subpath: String,
      // 路由配置中的meta信息
      meta: Object,
      // 路由配置中的meta信息(已完成计算)
      metaComputed: Object,
      // 路由的状态信息，可以通过router.replaceState(state: State, matchedRoute?: MatchedRoute)来更新指定matchedRoute的state
      state: Object,
      // 路由配置的中的redirect
      redirect: String|Object|Function,
      // 原始的路由配置对象
      config,
      // 匹配该路由的组件实例
      componentInstances: {
        default: React.Component,
        /* others: React.Component */
      }
      // 匹配该路由的RouterView实例
      viewInstances: {
        default: RouterView
      }
    }
    ..., 
    routeN
  ],
  // 解析url得来的一个键值对像
  params: Object,
  // 解析url中?后面的查询参数得来的键值对像。例如：/foo?user=1, 则currentRoute.query.user == 1. 如果没有查询参数，这它是一个空对象。
  query: Object,
  // 当前路由的元信息，等同于matched[matched.length - 1].meta
  meta: Object,
  // 路由配置中的meta信息(已完成计算)
  metaComputed: Object,
  // 当前路由的state信息，等同于matched[matched.length - 1].state
  state: Object,
  // 指示该路由是否是从哪个路由重定向过来的
  redirectedFrom: Object,
  // 来自`router.push`, `router.replace`, `router.redirect`路由的取消回调函数
  onAbort: Function,
  // 来自`router.push`, `router.replace`, `router.redirect`路由的完成回调函数
  onComplete: Function,
}
```
![示例](./images/route.png)

参见: [Route Object Properties](https://router.vuejs.org/api/#route-object-properties)

### ReactViewRouter 实例属性

- `id`  - 路由实例id，数字类型，用于标识一个路由实例的唯一性；

- `name` - 路由实例名称，在创建路由实例时，可以传递一个`name`参数为该路由实例取个名字以方便识别；

- `currentRoute` - 匹配当前url的当前路由信息。

- `initialRoute` - 当实例创建时的初始路由对象。

- `prevRoute` - 前一个路由信息。

- `mode` - 路由模式，值有: `hash`、`browser`、`memory`。

- `basename` - 当前路由实例的路由前缀，当不为空时始终以`/`结尾;

- `basenameNoSlash` - 当前路由实例的路由前缀，当不为空时始终不以`/`结尾;

- `parent` - 当前路由实例的父路由实例(如果有的话);

- `top` - 当前路由实例的最顶层路由实例，当等于自己时，标识自己就是最顶层的路由实例;

- `children` - 当前路由实例的子路由实例列表;

- `viewRoot` - 和当前路由实例关联的跟`RouterView`；

- `stacks: { index: number, pathname: string, search: string, timestamp: number }[]` - 路由堆栈，里面包含了当前跳转过的路由信息，通过它可以查看当前页面已经跳转过哪些路由，可以通过 `go` 方法`前进/回退`到该路由，或者通过`getMatched`获取该路由匹配的所有路由配置。示例：

    ```js
    let stack = router.stacks.find(v => v.pathname.startsWith('/home'));
    if (stack) {
      let matched = router.getMatched(stack);
      // 如果是主页，就回退到该页
      if (matched.some(r => r.meta.isHome)) router.go(stack);
    }
    ```

  - `isRunning` - `router`实例是否在运行状态，当为`false`时将不会响应路由事件；

  - `isRunning` - `router`实例是否在运行状态，当为`false`时将不会响应路由事件；

  - `isPrepared` - 当前路由是否已准备好 - `根路由`、`currentRoute`已经生成完成；

  - `isHistoryCreater` - 是否是内部的`history`的创建者；

  - `isBrowserMode` - 是否是`browser`路由模式；

  - `isHashMode` - 是否是`hash`路由模式；

  - `isMemoryMode` - 是否是`memory`路由模式；

### ReactViewRouter 实例方法

#### `beforeEach` [全局前置守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards)

```js
const router = new ReactViewRouter({ ... })

router.beforeEach((to, from, next) => {
  // ...
})
```

当一个导航触发时，全局前置守卫按照创建顺序调用。守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于 等待中。

每个守卫方法接收三个参数：

- `to: Route`: 即将要进入的目标 [路由对象](#ReactViewRouter属性)

- `from: Route`: 当前导航正要离开的路由
- `next: Function`: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。

    - `next()`: 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。

    - `next(false)`: 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。

    - `next('/')` 或者 `next({ path: '/' })`: 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。你可以向 next 传递任意位置对象，且允许设置诸如 `replace: true`之类的选项。

    - `next(error)`: 如果传入 next 的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调。

确保 next 函数在任何给定的导航守卫中都被严格调用一次。它可以出现多于一次，但是只能在所有的逻辑路径都不重叠的情况下，否则钩子永远都不会被解析或报错。

** 这里有一个在用户未能验证身份时重定向到 /login 的示例：

```js
// BAD
router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !isAuthenticated) next({ name: 'Login' })
  // 如果用户未能验证身份，则 `next` 会被调用两次
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

注意：在beforeEach中，调用`router.push`、`router.replace`、`router.redirect`等同于调用next方法。即下面2中写法作用是相同的：

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

#### `beforeResolve` [全局解析守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#全局解析守卫)

你可以用 router.beforeResolve 注册一个全局守卫。这和 router.beforeEach 类似，区别是`在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后`，解析守卫就被调用。

#### `afterEach` [全局后置钩子](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#全局后置钩子)

你也可以注册全局后置钩子，然而和守卫不同的是，这些钩子不会接受 next 函数也不会改变导航本身：

```js
router.afterEach((to, from) => {
  // ...
})
```

#### `push`、`replace`、`go`、`back`、`forward` `redirect`[编程式的导航](https://router.vuejs.org/zh/guide/essentials/navigation.html)

这些方法的参数可以是一个字符串路径，或者一个描述地址的对象。例如：
```js
// 字符串，相对路径
router.push('home')
// 字符串，绝对路径
router.push('/home')

// 对象
router.replace({ path: '/home' })

// 从上一层路由开始跳转
router.push({ path: '../home' });

// 带动态参数
router.push({ path: '/user', params: { userId: '123' }})

// 带查询参数，变成 /register?plan=private
router.push({ path: '/register', query: { plan: 'private' }})

// 当router的basename不为空时，如果想跳转时忽略basename，则可以添加个absolute参数
router.push({ path: '/register', absolute: true, query: { plan: 'private' }})

// 通过路由名称跳转
router.push({ path: '[a-route-name]/register', })

// 返回前一个路由
router.go(-1);

// 等同于router.replace，只是路由对象里会多一个isRedirect: true的标志
router.redirect({ path: '/home' })

// 先回退到两步之前，在跳转到home路由
router.push({ path: '/home', delta: -2 });

// 跳转到外部地址，等同于location.href = ''
router.push('http://www.baidu.com')
```

可选择在`router.push` 或 `router.replace` 中提供 `onComplete` 和 `onAbort` 回调作为第二个和第三个参数。这些回调将会在导航成功完成 (在所有的异步钩子被解析之后) 或终止 (导航到相同的路由、或在当前导航完成之前导航到另一个不同的路由) 的时候进行相应的调用。可以省略第二个和第三个参数，此时如果支持`Promise`，`router.push` 或 `router.replace` 将返回一个 `Promise`。

`router.push`、`router.replace`、`router.redirect`的第一个参数对象格式可以支持以下参数：
```ts
{
  // 调整的路径，可以是完整的url，也可以是`/`开头的绝对路径，或者'./'、'../'这样的相对路径
  path?: string,
  // 查询参数，即url中?后面的参数部分
  query?: Partial<any>,
  // 当path非完整url,并且不是以'/'、'./'、'../'开头时，path会识别成替换当前路径的最后一节子路径。当append为true是，则表示在当前路径后面追加。
  append?: boolean,
  // 当router的basename不为空时，除了完整url，都会在最终跳转路径之前添加上basename，如果不想让router添加，可以设置absolute为true
  // absolute也可以是取'hash' | 'browser' | 'memory'值，router默认将父路由的模式与自己相同，但当router为memory模式时，是无法推算副路由的模式的，这时可以通过absolute设置父路由模式方便router识别要跳转的方式
  absolute?: boolean|string,
  // 表示跳转该路径前，先前进/回退`delta`步路由历史后再跳转
  delta?: number,
  // 当path为'./'、'../'或其他相对路径时的参考路由，在ReactViewLike组件中，可以通过this.$matchedRoute取到
  route?: ConfigRoute,
}
```

#### `parseQuery`、`stringifyQuery` 

内部使用的url的query解析/字符串化方法，可以通过`new ReactViewRouter({ parseQuery: parseQueryMethod, stringifyQuery: stringifyQueryMethod });`来复写。

注：默认的解析器会将query中的`true`、`false`、`null`、`undefined`、`JSON对象/数组`解析成对应类型，而非字符串。

### `createRoute(to: string | object, options: { from?: object, action?: string, matchedProvider?: object })`

将`string`、`{ path: string, query: {} }`类型的路由信息根据转换成和`router.currentRoute`一样的格式，并且已经解析好`matched`，你可以通过它来获取该地址匹配的路由配置信息。

### `nameToPath(name: string, options: { absolute?: boolean }|RouteHistoryLocation = {}) => string `

将某个路由名称转换为对应的路径，可以通过该方法判断某个路由名称是否存在。`options.absolute`表示是否是绝对路径，如果是，则也将会从父路由的中寻找路由名称。

### `resolveRouteName(fn: RouteResolveNameFn) => () => void`

注册一个路由名称解析函数，当`nameToPath`无法从路由配置中找到对应的路由名称时，会调研这些解析函数解析。返回值是一个回调函数，用于注销该解析函数。

函数签名`RouteResolveNameFn`格式为：
```ts
  (name: string, options: { absolute?: boolean }|RouteHistoryLocation, router: ReactViewRouter) => string|null|void
```
当解析函数返回值不为`null`或`undefined`时，表示找到对应的路径，返回值将会当做该路由名称的路径返回

- 注：如果`options.absolute`为`true`，请自行处理它的`basename`。

### `getMatched(to: string | object, from?: object, parent?: object)`

根据`string`、`{ path: string, query: {} }`类型的路由信息获取它能匹配的所有路由配置，你可以通过匹配的路由配置中取得的信息做一些事情。下面是一段该方法在实际场景中的应用：

    ```js
    /**
     * 根据路由获取当前菜单路径，例如：个税申报>>申报总览，用于在线咨询入参
     * @param {Object} route 当前路由
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

更新当前路由(`currentRoute`)或者指定`matchedRoute`的`state`，这样当从其他页面回退到该路由时，将可以通过`router.currentRoute.state`或`router.currentRoute.matched[N].state`取到当时设置的state值。

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
    <Button onClick={setRouteState}>设置State</Button>
  </div>;
}
```

### `replaceQuery(keyOrObj: string, value?: any)`

更新当前路由(`currentRoute`)的`query`中的指定参数。如果`router`的`mode`是`browser|hash`，同时也会更新url上对应的参数；

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
    <Button onClick={updateQueryTest}>更新query中的test</Button>
    <Button onClick={updateQueryObj}>更新query中多个参数</Button>
  </div>;
}
```

#### `plugin(plugin: ReactViewRoutePlugin): () => void`

注册一个`ReactViewRouter`插件，该插件可以用于监听路由中的各种事件，并做一些处理。如：

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

注意：插件名如果相同将被认作同一个插件，注册该插件时，会先将原先同名的插件卸载掉再注册

插件支持的方法有：

```ts
type onRouteChangeEvent = (route: Route, prevRoute: Route, router: ReactViewRouter, prevRes?: any) => void;
type onRouteMetaChangeEvent = (newVal: any, oldVal: any, route: ConfigRoute, router: ReactViewRouter, prevRes?: any) => void;

interface ReactViewRoutePlugin {
  // 插件名称
  name: string;
  // 插件的装载方法，在调用`router.plugin()`方法中会被调用
  install?(router: any): void;
  // 插件卸载方法，在调用`router.plugin()`注册插件时发现同名插件时会uninstall该插件，再注册。或者是调用`router.plugin()`返回的卸载方法时也会调用uninstall
  uninstall?(router: any): void;

  // 当启动路由监听时调用
  onStart?(router: ReactViewRouter, routerOptions: ReactViewRouterOptions, isInit: boolean|undefined, prevRes?: any): void;
  // 当停止路由监听时调用
  onStop?(router: ReactViewRouter, isInit: boolean|undefined, prevRes?: any): void;

  // 当router.routes发生改变时(use设置routes、调用addRoutes添加路由)被触发，当routes === originRoutes时表示在在原有routes里新增了路由；
  onRoutesChange?(
    routes: ConfigRouteArray,
    originRoutes: ConfigRouteArray,
    parent?: ConfigRoute|null,
    parentChildren?: ConfigRouteArray,
    prevRes?: any
  ): void;

  // 当调用router.push、router.replace、router.redirect方法时被触发，你可以在该事件里中断默认的路由跳转行为，改为你自己的操作；
  onRouteGo?(
    to: RouteHistoryLocation,
    onComplete: (res: any, _to: Route|null) => void,
    onAbort: (res: any, _to: Route|null) => void,
    isReplace: boolean,
    prevRes?: any
  ): void|boolean;

  // 路由进入的守卫事件
  onRouteEnterNext?(route: MatchedRoute, ci: React.Component, prevRes?: any): void;
  // 路由离开的守卫事件
  onRouteLeaveNext?(route: MatchedRoute, ci: React.Component, prevRes?: any): void;
  // 当路由发生改变，正在解析、判断路由是否可以跳转的过程前后被调用
  onRouteing?(next: boolean|onRouteingNextCallback|Route, prevRes?: any): void;
  // 当路由发生改变时被调用
  onRouteChange?: onRouteChangeEvent;
  // 当路由meta发生改变时被调用
  onRouteMetaChange?: onRouteMetaChangeEvent;
  // 当解析异步路由懒加载拿到真实的路由组件时被调用
  onLazyResolveComponent?(
    nc: React.ComponentType|React.ForwardRefExoticComponent<any>,
    route: ConfigRoute,
    prevRes?: any
  ): React.ComponentType | undefined;
  // 当向router中注册routes时，router初次遍历routes中没有route时被调用
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

  // 当路由调整被终止时被调用
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

#### `install` `ReactVueLike`插件装载方法. 参见: [ReactVueLike](https://github.com/gxlmyacc/react-vue-like)

```js
import vuelike from '@/vuelike';
import ReactViewRouter from 'react-view-router';

const router = new ReactViewRouter();

vuelike.use(router);
```


### 导出的其他方法
- `withRouteGuards` 路由组件的守卫方法:

```js
/**
 * 路由组件的守卫注册方法
 * @param {Object} component - 路由组件
 * @param {Object} guards - 守卫方法
 * @param {Class} [componentClass] - 路由组件的类，如果component是被高阶组件包装过的话，可以通过该参数来指明正确的路由组件
 * @return {RouteComponentGuards} - 可以被当做`React.forwardRef`来使用的路由组件
 **/
function withRouteGuards(component, guards = {}, componentClass?) {}
```

示例：

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

- `lazyImport` 路由组件懒加载方法:
```ts
type LazyImportMethod<P = any> = (route: ConfigRoute, key: string, router: ReactViewRouter, options: Partial<any>) => P | Promise<P>;

/**
 * 路由组件懒加载方法
 * @param {LazyImportMethod} importMethod - webpack的import懒加载方法, 示例: () => import('@/components/some-component')
 * @return {RouteLazy} - 返回值可以作为路由配置中的component/components值，来实现懒加载
 **/
function lazyImport(importMethod: LazyImportMethod, options?: Partial<any>): RouteLazy;
```

- `normalizeRoutes` 正规化路由配置:
```ts
/**
 * 正规化路由配置
 * @param {UserConfigRoute[]} routes - 为正规化的路由配置
 * @param {ConfigRoute} [parent] - 如果提供，则routes将会被当做它的子路由配置信息
 * @return {ConfigRouteArray} - 正规化后的路由配置
 **/
function normalizeRoutes(routes: UserConfigRoute[], parent?: ConfigRoute): ConfigRouteArray;
```
- `normalizeLocation` 正规化路由字符串或对象为统一格式的路由对象:
```javascript
/**
 * 正规化路由字符串或对象为统一格式的路由对象
 * @param {Object|string} to - 待正规化的地址对象
 * @param {Object} [options] - 其他选项
 * @param {Object} [options.route] 地址对象的父路由，如果提供的话，路由中的相对路径将会基于它来解析
 * @return {Object} - 正规化后的路由对象: { path: string, pathname: string, search: string, query: Object, ...custom props } 
 **/
function normalizeLocation(to, options: { route? } = {}) {}
```

- `isLocation`判断 `v`是否是一个路由对象
```javascript
/**
 * 判断 `v`是否是一个路由对象
 * @param {Object} v - 待判定的对象
 * @return {boolean}
 **/
function isLocation(v) {}
```

- `matchPath` 只是重新导出，参见: [matchPath](https://reacttraining.com/react-router/web/api/matchPath)


- `createRouterLink` - 创建一个基于某个`router`的`router-link`组件。你可以在创建`router`的同时，创建一个该组件：

    ```js
    import ReactViewRouter, { createRouterLink } from 'react-view-router';

    const router = new ReactViewRouter();
      
    const RouterLink = createRouterLink(router);

    export {
      RouterLink
    }

    export default router;
    ```

- `createRouteGuardsRef` 创建路由守卫引用

  该方法是在使用者不想使用`useRouteGuardsRef`，而是直接使用`useImperativeHandle`时，通过该方法创建一个和`useRouteGuardsRef`等效的兼容实例。

  示例：
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
            await modals.confirm({ content: '确定要离开吗？' });
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

- `readRouteMeta` 读取ConfigRoute中`meta`的某个值，当值为函数时，会将其当做
  ```ts 
  function (route: ConfigRoute, routes: ConfigRoute[], props: Partial<any>): any
  ```
回调进行调用，并将其返回值返回；

  ```javascript
  /**
   * @param {ConfigRoute} route - 要读取meta的ConfigRoute
   * @param {string} key - 要读取meta的参数名
   * @param {props: Partial<any>} props - 将作为第三个参数传递给meta的value函数
   * @return {any}
   **/
  function readRouteMeta(route: ConfigRoute, key: string = '', props: {
    router?: ReactViewRouter|null,
    [key: string]: any
  } = {}): any
  ```

## HOCS/HOOKS

`react-view-router`也支持HOC/HOOKS

### HOCS

### withRouter

获取router实例，函数签名如下：

```javascript
/**
 * @param {React.ComponentType} Comp - 待封装的组件 
 * @param {object} [options] - 选项 
 * @param {boolean} [options.withRoute] - 是否也获取当前route对象
 * @return {React.ComponentType}
 **/
const withRouter = (Comp: React.ComponentType, { withRoute: boolean = false }) => React.ComponentType
```

### withRoute

获取route对象，函数签名如下：

```javascript
/**
 * @param {React.ComponentType} Comp - 待封装的组件 
 * @param {object} [options] - 选项 
 * @param {boolean} [options.withRouter] - 是否也获取当前router实例
 * @return {React.ComponentType}
 **/
const withRoute = (Comp: React.ComponentType, { withRouter: boolean = false }) => React.ComponentType
```

### withMatchedRoute

获取当前层级匹配的matchedRoute对象，函数签名如下：

```javascript
/**
 * @param {React.ComponentType} Comp - 待封装的组件 
 * @param {object} [options] - 选项 
 * @param {boolean} [options.withMatchedRouteIndex] - 是否也获取当前层级索引
 * @return {React.ComponentType}
 **/
const withMatchedRoute = (Comp: React.ComponentType, { withMatchedRouteIndex: boolean = false }) => React.ComponentType
```

### withMatchedRouteIndex

获取当前层级获取当前层级索引，函数签名如下：

```javascript
/**
 * @param {React.ComponentType} Comp - 待封装的组件 
 * @param {object} [options] - 选项 
 * @param {boolean} [options.withMatchedRoute] - 是否也获取当前层级匹配的matchedRoute对象
 * @return {React.ComponentType}
 **/
const withMatchedRouteIndex = (Comp: React.ComponentType, { withMatchedRoute: boolean = false }) => React.ComponentType
```

### withRouterView

获取当前层级的RouteView实例，函数签名如下：

```javascript
/**
 * @param {React.ComponentType} Comp - 待封装的组件 
 * @param {object} [options] - 选项
 * @return {React.ComponentType}
 **/
const withRouterView = (Comp: React.ComponentType, {}) => React.ComponentType
```

### HOOKS

### useRouter

获取router实例，函数签名如下：

```javascript
/**
 * @return {ReactViewRouter|null}
 **/
const useRouter = (defaultRouter?: ReactViewRouter|null) => ReactViewRouter|null
```

### useRoute

获取route对象，函数签名如下：

```javascript
/**
 * @param {ReactViewRouter} [defaultRouter] 默认的路由管理组件，当不传时它会根据上下文来寻找
 * @param {object} [options]  匹配选项
 * @param {boolean} [options.watch]  是否监听路由变化
 * @param {number|boolean = false} [options.delay]  路由发生变化时是否异步通知路由变更
 * @param {boolean = true} [options.ignoreSamePath]  路由发生变化前后的路由fullPath相同，则不触发组件重新渲染
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

获取当前路由层级的路由元信息，你可以读取其中信息，并对它进行修改。

```javascript
/**
 * @return {Route}
 **/
const useRouteMeta = (key: string|string[]): [Partial<any>, (key: string|string[], value: any) => void]
```

示例：
```js
import { useRouteMeta } from 'react-view-router';

function Test() {
  const [title, setTitle] = useRouteMeta('title');

  return <>
    <button
      onClick={() => setTitle('标题被修改')}
    >修改标题</button>
    <div>{title}</div>
  </>
}
```

### useRouteMetaChanged

注册一个路由元信息变更事件，该方法在通过路由元信息生成数据的组件中会比较有用

```javascript
/**
 * @return {Route}
 **/
const useRouteMetaChanged = (router: ReactViewRouter, onChange: onRouteMetaChangeEvent, depMetaKeys: string[] = [])
```

示例：
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
      onClick={() => setRouteMeta('title', '标题被修改')}
    >修改标题</button>
    <div>{title}</div>
  </>
}
```

### useMatchedRoute

获取当前层级匹配的matchedRoute对象，函数签名如下：

```javascript
/**
 * @param {ReactViewRouter} [defaultRouter] 默认的路由管理组件，当不传时它会根据上下文来寻找
 * @param {object} [options]  匹配选项
 * @param {number = 0} [options.matchedOffset]  匹配的matchedRoute的(向前)偏移量
 * @param {string} [commonPageName] 公共路由的meta名称，如果commonPageName不为空并且currentRoute的meta中该名称的属性值为true，并且currentRoute.query.redirect不为空，则将会从currentRoute.query.redirect中解析matchedRoute
 * @param {boolean = true} [options.watch]  是否监听路由变化
 * @param {number|boolean = false} [options.delay]  路由发生变化时是否异步通知路由变更
 * @param {boolean = true} [options.ignoreSamePath]  路由发生变化前后的路由fullPath相同，则不触发组件重新渲染
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

获取当前层级获取当前层级索引，函数签名如下：

```javascript
/**
 * @param {ReactViewRouter} [defaultRouter] 默认的路由管理组件，当不传时它会根据上下文来寻找
 * @param {number} [matchedOffset]  匹配的matchedRoute的(向前)偏移量，默认值为0
 * @return {number}
 **/
const useMatchedRouteIndex = (matchedOffset?: number = 0) => number
```

### useRouterView

获取当前层级的RouteView实例，函数签名如下：

```javascript
/**
 * @return {RouterView}
 **/
const useRouterView = () => RouterView
```

### useRouteGuardsRef

该方法封装了`useImperativeHandle` hooks，你可以通过该方法注册路由守卫。


```javascript
/**
 * @param {Ref} ref 通过React.forwardRef获取的ref
 * @param {T|(() => T)} guards 路由守卫对象，支持beforeRouteLeave、beforeRouteResolve、afterRouteLeave、beforeRouteUpdate守卫
 * @param {DependencyList} deps 传给useImperativeHandle的deps
 * @return {void} 
 **/
function useRouteGuardsRef<T extends RouteGuardsInfo>(
  ref: Ref<T>|undefined,
  guards: T|(() => T),
  deps: DependencyList = []
): void
```

示例：

```js
import React from 'react';
import { useRouteGuardsRef } from 'react-view-router';
import modals from '~/utils/modals';

const Test = React.forwardRef((props, ref) => {
  useRouteGuardsRef(ref, {
    async beforeRouteLeave(to, from, next) {
      console.log('Test beforeRouteLeave', to, from);
      try {
        await modals.confirm({ content: '确定要离开吗？' });
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

注意：不要将`useRouteGuardsRef`和`useImperativeHandle`在一个函数组件中混用。

### useRouteChanged

为指定的`router`注册一个路由变更回调事件，函数签名如下：

```javascript
/**
 * @return {RouterView}
 **/
const useRouteChanged = (router: ReactViewRouter, onChange: onRouteChangeEvent) => void
```
示例：

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

### useRouteTitle

遍历路由配置，检索出路由配置中`meta.title`、`meta.visible`过滤出来的信息，其中`meta.title`、`meta.visible`可以是一个函数。你可以根据该信息来创建菜单、标签页等。函数签名如下：

```ts
// `meta.title`、`meta.visible`可以是boolean值，也可以下面这样的函数
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
  // useRouteTitle的最大检索层级
  maxLevel?: number,
  // 对过滤出来的title信息进行自定义的过滤
  filter?: filterCallback,
  // 指定filter依赖的ConfigRoute中的meta参数名，以便它们更新时可以触发titles的更新
  filterMetas?: string[],
  /**
   * 是否是手动模式，当为true时，第一次调用useRouteTitle时不会主动检索ConfigRoute，直到你调用一次refreshTitles后，
   * 可以通过该参数实现异步展示菜单、标签栏等方案
   **/
  manual?: boolean,
  // 匹配的matchedRoute的(向前)偏移量，默认值为0
  matchedOffset?: number;
  // 公共页面meta的key值，默认为'commonPage'。即当某个匹配路由的meta中包含commonPage: true时，并且router.currentRoute.query.redirect不为空时，解析路由将会改为从router.currentRoute.query.redirect重新解析titles
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
 * @param {RouteTitleProps} props 参数
 * @param {ReactViewRouter} defaultRouter 默认的路由实例
 * @param {DependencyList} deps 传给useRouteTitle的deps
 * @return {RouteTitleResult} 
 **/
function useRouteTitle(
  props: RouteTitleProps = {},
  defaultRouter?: ReactViewRouter,
  deps: any[] = []
): RouteTitleResult;
```
左侧菜单示例：

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
    // 从当前组件所在的路由层级再向下2级开始查找匹配titles
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

标签栏示例：

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
## ReactViewLike集成

`react-view-router`可以作为`ReactVueLike`的插件来使用：

```js
import vuelike from '@/vuelike';
import ReactViewRouter from 'react-view-router';

const router = new ReactViewRouter({
  basename: '',     // app的basename,若页面路由是在/app/下面，则base的值应该为"/app/"
  mode: 'hash', // 路由类型 browser|memory|hash, default:hash
  routes: []    // 路由配置数组，也可以使用router.use方法来初始化
});
   
vuelike.use(router);
```
这样既可将`router`注册为ReactVueLike的插件。注册后，将有以下功能：


### 组件级的路由事件

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


### 注入对象

在`ReactVueLike.Component`组件实例中，可以取到：

- `$router` - 当前路由管理实例
- `$route` - object, 当前路由信息，等同于`router.currentRoute`
- `$matchedRoute` object, 当前匹配的子路由信息
- `$routeIndex` number， 当前匹配的子路由的索引

三者的关系是：`$route.matched[$routeIndex] === $matchedRoute`。

下面是一个“通过从路由元信息中读取tab标签页信息并渲染”的一个示例：
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

### 监听路由变化

通过`ReactVueLike.Component`的`watch`功能可以监听路由变化来做一些事情。

示例：

```js
import React from 'react';
import ReactVueLike from 'react-vue-like';

class MainSider extends ReactVueLike.Component {

  static watch = {
    $route(newVal, oldVal) {
      if (!newVal || !oldVal) return;
      // 路由变化时，更新左侧菜单信息
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

## 路由转场动效

你可以通过`import RouterView from 'react-view-router/transition'`引用支持路由转场动效的`RouterView`来为页面添加简单的转场动效。目前支持`fade|slide|carousel`三种动效：

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

用法和普通的`RouterView`一样，只是多添加了`transition`、`transitionPrefix`、`transitionZIndex`、`routerView`四个额外属性：
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

- `transition` - 动效的名称，目前支持`slide`、`fade`两种动效。它也可以是一个对象。
- `transitionPrefix` - 动效的`className`前缀，默认为`react-view-router-`。如果你修改了该值，则动效的样式需要由你自己来提供；
- `transitionZIndex` - 进场/离场页面的`zIndex`，默认为1000。若当前是`slide`动效，并且当前页面中存在zIndex大于1000的元素时，你可以通过设置`transitionZIndex`为更高的值来避免该元素穿透转场页面。

## 中台模块中路由处理

中台模块如果需要配置路由时，需要将它的路由添加到宿主项目的路由地址后面追加，`react-view-router`也支持这种模式的开发。

1. 配置路由实例为手动模式：

```js
import ReactViewRouter from 'react-view-router';
import routes from './routes';

const router = new ReactViewRouter({
  manual: true,
  routes
});

export default router;
```

2. 在模块初始化/销毁时启动路由监听

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
或者在组件中：

```js
import React from 'react';
import { useManualRouter, RouterView } from 'react-view-router';
import router from '@/history';

/** 
 * 全局的路由拦截事件
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

1. `react-view-router`不依赖`react-vue-like`，可以独立使用

2. 如果路由组件是`Class Component` (不是 `Function Component`), 则在`beforeRouteUpdate`,`beforeRouteLeave`,`afterRouteLeave` 组件的守卫函数都会绑定到 `this`变量，它指向当前组件实例;

