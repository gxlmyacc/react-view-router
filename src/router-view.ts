import React, { useState, useEffect, ReactNode } from 'react';
import {
  renderRoute, normalizeRoute, normalizeRoutes, isFunction,
  isRouteChanged, isRoutesChanged, isPropChanged,
  getHostRouterView, warn, hasOwnProp
} from './util';
import ReactViewRouter from './router';
import {
  MatchedRoute, ConfigRoute, RouteHistoryLocation, ReactViewContainer,
  RouteBeforeGuardFn, RouteAfterGuardFn, ConfigRouteArray
} from './types';
import { computeRootMatch } from './match-path';
import { RouterContext, RouterViewContext } from './context';

export interface RouterViewProps extends React.HTMLAttributes<any> {
  name?: string,
  filter?: RouterViewFilter,
  fallback?: ReactViewFallback | React.Component,
  container?: ReactViewContainer,
  router?: ReactViewRouter,
  depth?: number,
  excludeProps: string[],
  beforeEach?: RouteBeforeGuardFn,
  afterEach?: RouteAfterGuardFn,

  _updateRef?: React.RefCallback<RouterView>|null,
  [key: string]: any
}

export interface RouterViewState {
  _routerView: RouterView,
  _routerRoot: boolean,
  _routerParent: RouterView | null,
  _routerDepth: number,
  _routerInited: boolean,
  _routerResolving: boolean,

  router?: ReactViewRouter,
  parentRoute: MatchedRoute | null,
  currentRoute: MatchedRoute | null,
  routes: ConfigRouteArray,
}

export interface RouterViewDefaultProps {
  excludeProps: string[];
}

export type RouterViewFilter = (route: ConfigRouteArray, state: RouterViewState) => ConfigRoute[];
export type ReactViewFallback = (state: {
  parentRoute: MatchedRoute | null,
  currentRoute: MatchedRoute | null,
  inited: boolean,
  resolving: boolean,
  depth: number
}) => React.ReactElement;

function normalizeRouterViewProps(props: RouterViewProps) {
  if (props.beforeEach && !hasOwnProp(props.beforeEach, 'global')) props.beforeEach.global = true;
  if (props.afterEach && !hasOwnProp(props.afterEach, 'global')) props.afterEach.global = true;
}
class RouterView<
  P extends RouterViewProps = RouterViewProps,
  S extends RouterViewState = RouterViewState,
  SS = any
> extends React.Component<P, S, SS> {

  _isMounted: boolean;

  target: typeof RouterView;

  _reactInternalFiber?: any;

  _reactInternals?: any;

  static defaultProps: RouterViewDefaultProps;

  constructor(props: RouterViewProps) {
    super(props as P);
    const router = props && props.router;
    const depth = (props && props.depth) ? Number(props.depth) : 0;
    const state: RouterViewState = {
      _routerView: this,
      _routerRoot: true,
      _routerParent: null,
      _routerDepth: depth,
      _routerInited: false,
      _routerResolving: false,

      router,
      parentRoute: null,
      currentRoute: null,
      routes: router ? this._filterRoutes(router.routes) : [],
    };
    this._isMounted = false;
    this.state = state as S;
    this.target = new.target;

    normalizeRouterViewProps(props);

    this._updateRef = this._updateRef.bind(this);
    this._filterRoutes = this._filterRoutes.bind(this);
  }

  get name(): string {
    let name = this.props.name;
    if (!name) return 'default';
    return name as string;
  }

  get currentRef() {
    let currentRoute = this.state.currentRoute;
    return currentRoute && currentRoute.componentInstances[this.name];
  }

  _updateRef(ref: RouterView) {
    let currentRoute = this.state.currentRoute;
    if (currentRoute) currentRoute.componentInstances[this.name] = ref;
    if (this.props && this.props._updateRef) this.props._updateRef(ref);
    // if (this._isMounted) this.setState({ currentRoute });
  }

  _filterRoutes(routes: ConfigRoute[], state?: RouterViewState) {
    const { name, filter } = this.props;
    let ret = routes && routes.filter(r => {
      if (r.config) r = r.config;
      const hasName = name && name !== 'default';
      if (r.redirect || r.index) return hasName ? name === r.name : !r.name;
      return hasName
        ? (r.components && r.components[name as string])
        : r.component || (r.components && r.components.default);
    });
    if (filter) ret = filter(ret, state || this.state);
    return ret;
  }

  _getRouteMatch(state: RouterViewState, depth = 0) {
    if (!state) state = this.state;
    const matched = (state.router && state.router.currentRoute && state.router.currentRoute.matched) || [];
    return matched.length > depth ? matched[depth] : null;
  }

  _refreshCurrentRoute(state?: S, newState?: S, callback?: () => void) {
    if (!state) state = this.state;
    const router = state.router;
    if (!router) throw new Error('state.router is null!');
    let currentRoute = this._getRouteMatch(state, state._routerDepth);

    if (!currentRoute) {
      let route = normalizeRoute({ path: '' }, state.parentRoute && state.parentRoute.config);
      currentRoute = router.createMatchedRoute(
        route,
        computeRootMatch()
      );
      router.currentRoute && router.currentRoute.matched.push(currentRoute);
    } else if (!currentRoute || currentRoute.redirect) currentRoute = null;

    if (currentRoute) {
      currentRoute.viewInstances[this.name] = this;
    }
    if (this.state && this.state._routerInited) {
      if (newState) Object.assign(newState, { currentRoute });
      else if (this._isMounted) {
        if (router._isVuelikeComponent(this.currentRef)
          && isRouteChanged(this.state.currentRoute, currentRoute)) {
          this.currentRef._willUnmount && this.currentRef._willUnmount();
        }
        try {
          this.setState({ currentRoute });
        } catch (ex) {
          console.error(ex);
        }
      }
    }
    if (this._isMounted) callback && callback();
    return currentRoute;
  }

  _updateResolving(resolving: any) {
    if (this._isMounted) this.setState({ _routerResolving: Boolean(resolving) });
  }

  _resolveFallback() {
    let ret = null;
    let fallback = this.props.fallback;
    if (isFunction(fallback)) {
      ret = fallback({
        parentRoute: this.state.parentRoute,
        currentRoute: this.state.currentRoute,
        inited: this.state._routerInited,
        resolving: this.state._routerResolving,
        depth: this.state._routerDepth
      });
    } else if (React.isValidElement(fallback)) ret = fallback;
    return ret || null;
  }

  isNull(route: any) {
    return !route || !route.path || route.subpath === '' || route.isNull;
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this.state._routerInited) return;
    const state = { ...(this.state as S) };


    if (state._routerRoot && state.router) {
      const router = state.router;
      router.viewRoot = this;
      // if (!router.parent) {
      //   let parent = getHostRouterView(this);
      //   router.parent = (parent && parent.state.router) || null;
      // }

      const pendingRoute = router.pendingRoute;
      router.pendingRoute = null;

      if (!router.isRunning) {
        warn('[react-view-router] warning: router is not running in RouterView.componentDidMount');
      }
      const [, location] = router.history.getIndexAndLocation
        ? router.history.getIndexAndLocation()
        : [router.history.index, router.history.location];
      router._handleRouteInterceptor(
        pendingRoute || { ...(location as RouteHistoryLocation) },
        (ok, to) => {
          if (!ok) return;
          router && to && router.updateRoute(to as any);
          state.currentRoute = this._refreshCurrentRoute();
          if (isFunction(ok)) ok(true, router.currentRoute);
          if (this._isMounted) this.setState(Object.assign(state, { _routerInited: this._isMounted }));
        },
        true,
      );
      return;
    }

    if (!this._reactInternalFiber && !this._reactInternals) return;

    let parent = getHostRouterView(this);
    if (parent) {
      state._routerRoot = false;
      state._routerParent = parent.state._routerView;
      if (!state.router) state.router = parent.state.router;
      state._routerDepth = parent.state._routerDepth + 1;
    }

    if (state._routerDepth) {
      state.parentRoute = this._getRouteMatch(state, state._routerDepth - 1);
      state.routes = state.parentRoute ? this._filterRoutes(state.parentRoute.config.children as ConfigRoute[]) : [];
      state.currentRoute = this._refreshCurrentRoute(state);
    } else console.error('[RouterView] cannot find root RouterView instance!', this);

    if (this._isMounted) this.setState(Object.assign(state, { _routerInited: true }));
  }

  componentWillUnmount() {
    this._isMounted = false;
    const { _routerRoot, router } = this.state;
    _routerRoot && router && (router.viewRoot = null);
  }

  shouldComponentUpdate(nextProps: RouterViewProps, nextState: RouterViewState) {
    if (!this._isMounted) return false;
    if (this.state._routerResolving !== nextState._routerResolving) return true;
    if (this.state._routerInited !== nextState._routerInited) return true;
    if (this.state._routerDepth !== nextState._routerDepth) return true;
    if (this.state.router !== nextState.router) return true;
    if (isPropChanged(this.props, nextProps, key => {
      if (key === 'fallback' && nextState._routerResolving) return false;
      return true;
    })) return true;
    if (isRouteChanged(this.state.currentRoute, nextState.currentRoute)) return true;
    if (isRoutesChanged(this.state.routes, nextState.routes)) return true;
    return false;
  }

  static getDerivedStateFromProps(nextProps: RouterViewProps) {
    normalizeRouterViewProps(nextProps);
    return null;
  }

  push(...routes: ConfigRoute[]) {
    const state = { ...this.state };
    state.routes.push(...normalizeRoutes(routes, state.parentRoute && state.parentRoute.config));
    if (this._isMounted) this.setState(state);
    return state.routes;
  }

  splice(idx: number, len: number, ...routes: ConfigRoute[]) {
    const state: RouterViewState = { ...this.state };
    const ret = state.routes.splice(idx, len, ...normalizeRoutes(routes, state.parentRoute && state.parentRoute.config));
    if (state.currentRoute && ret.some(r => r === state.currentRoute?.config)) state.currentRoute = null;
    if (this._isMounted) this.setState(state);
    return ret;
  }

  indexOf(route: string | ConfigRoute) {
    if (typeof route === 'string') route = { path: route } as ConfigRoute;
    const { routes } = this.state;
    return routes.findIndex(r => r.path === (route as ConfigRoute).path);
  }

  remove(route: string | ConfigRoute) {
    if (typeof route === 'string') route = { path: route } as ConfigRoute;
    let { routes, currentRoute } = this.state;
    const index = this.indexOf(route);
    if (~index) {
      const route = routes[index];
      if (currentRoute && currentRoute.config === route) {
        currentRoute = null;
      }
      routes.splice(index, 1);
    }
    if (this._isMounted) this.setState({ routes, currentRoute });
    return ~index ? route : undefined;
  }

  getComponentProps() {
    let { children, ...props } = this.props;

    const excludeProps = this.target.defaultProps.excludeProps || RouterView.defaultProps.excludeProps || [];
    excludeProps.forEach((key: string) => delete (props as any)[key]);
    return {
      props,
      children
    };
  }

  getComponent(currentRoute: MatchedRoute | null) {
    if (!currentRoute) return null;

    const { routes, router } = this.state;
    const { query = {}, params = {} } = ((router && router.currentRoute) || {});
    let { children, props } = this.getComponentProps();

    return renderRoute(
      currentRoute,
      routes,
      props,
      children,
      {
        router,
        name: this.name,
        query,
        params,
        ref: this._updateRef
      }
    );
  }

  renderCurrent(currentRoute: MatchedRoute | null) {
    if (this.isNull(currentRoute)) return this.props.children || null;
    return this.getComponent(currentRoute);
  }

  renderContainer(current: ReactNode|null, currentRoute: MatchedRoute | null): ReactNode | null {
    const { routes, router, _routerDepth } = this.state;
    let { container } = this.props;

    if (router) {
      container = router._callEvent('onViewContainer', container, {
        routes,
        route: currentRoute,
        depth: _routerDepth,
        router,
        view: this,
      }) || container;
    }

    return container && currentRoute
      ? container(current, currentRoute, (current && (current as any).props) || this.getComponentProps(), this)
      : current;
  }

  render() {
    if (!this.state._routerInited) return this._resolveFallback();

    const { currentRoute } = this.state;

    let ret = this.renderCurrent(currentRoute);

    ret = React.createElement<any>(
      RouterViewContext.Provider,
      { value: this },
      this.renderContainer(ret, this.state.currentRoute)
    );

    if (this.state._routerRoot) {
      ret = React.createElement<any>(RouterContext.Provider, { value: this.state.router }, ret);
    }

    ret = React.createElement(
      React.Fragment,
      {},
      ret,
      this.state._routerResolving ? this._resolveFallback() : null,
    );

    return ret;
  }

}

const RouterViewWrapper = React.forwardRef((
  props: RouterViewProps,
  ref?: React.Ref<RouterView>
) => {
  const [isRunning, setIsRunning] = useState(!props.router || props.router.isRunning);

  useEffect(
    () => {
      if (!isRunning && props.router && props.router.isRunning) {
        setIsRunning(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRunning, props.router && props.router.isRunning]
  );

  return isRunning ? React.createElement(RouterView, {
    ...props,
    _updateRef: ref && (isFunction(ref) ? ref : (r: RouterView) => (ref.current as any) = r)
  }) : null;
});

RouterView.defaultProps = {
  excludeProps: ['_updateRef', 'router', 'excludeProps', 'beforeEach', 'afterEach', 'fallback', 'container']
};

export {
  RouterViewWrapper,
  RouterView as RouterViewComponent
};

export default RouterViewWrapper;
