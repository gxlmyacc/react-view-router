import React, { ReactElement } from 'react';
import {
  renderRoute, normalizeRoute, normalizeRoutes, isFunction,
  isRouteChanged, isRoutesChanged, isPropChanged,
  getHostRouterView
} from './util';
import ReactViewRouter from './router';
import { ConfigRoute, ConfigRouteArray } from './globals';

type RouterViewUpdateRef = (vm: React.Component | null) => void;

export interface RouterViewProps {
  name?: string,
  filter?: RouterViewFilter,
  fallback?: ReactViewFallback,
  container?: ReactViewContainer,
  router?: ReactViewRouter,
  depth?: number,
  _updateRef?: RouterViewUpdateRef,
  excludeProps: string[],
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
  parentRoute: ConfigRoute | null,
  currentRoute: ConfigRoute | null,
  routes: ConfigRoute[],
}

export interface RouterViewDefaultProps {
  excludeProps: string[];
}

export type RouterViewFilter = (route: ConfigRoute[], state: RouterViewState) => ConfigRoute[];
export type ReactViewFallback = (state: {
  parentRoute: ConfigRoute | null,
  currentRoute: ConfigRoute | null,
  inited: boolean,
  resolving: boolean,
  depth: number
}) => React.ReactElement;
export type ReactViewContainer = (
  result: React.ReactElement | null,
  route: ConfigRoute,
  props: RouterViewProps
) => React.ReactElement;

class RouterView<
  P extends RouterViewProps = RouterViewProps,
  S extends RouterViewState = RouterViewState,
  SS = any
> extends React.Component<P, S, SS> {

  _isMounted: boolean;

  target: typeof RouterView;

  _reactInternalFiber: any;

  static defaultProps: RouterViewDefaultProps

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

    this._updateRef = this._updateRef.bind(this);
    this._filterRoutes = this._filterRoutes.bind(this);
  }

  get name(): string {
    let name = this.props.name;
    if (!name) return 'default';
    return name as string;
  }

  _updateRef(ref: React.Component) {
    let currentRoute = this.state.currentRoute;
    if (currentRoute) currentRoute.componentInstances[this.name] = ref;
    if (this.props && this.props._updateRef) this.props._updateRef(ref);
    if (this._isMounted) this.setState({ currentRoute });
  }

  _filterRoutes(routes: ConfigRouteArray, state?: RouterViewState) {
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
    let route = matched.length > depth ? matched[depth] : null;
    return route;
  }

  _refreshCurrentRoute(state?: S, newState?: S) {
    if (!state) state = this.state;
    if (!state.router) throw new Error('state.router is null!');
    let currentRoute = this._getRouteMatch(state, state._routerDepth);

    if (!currentRoute) {
      currentRoute = state.router.createMatchedRoute(
        normalizeRoute({ path: '' }, state.parentRoute, state._routerDepth),
        state.parentRoute as any
      );
      state.router.currentRoute && state.router.currentRoute.matched.push(currentRoute);
    } else if (!currentRoute || currentRoute.redirect) currentRoute = null;

    if (currentRoute) currentRoute.viewInstances[this.name] = this;
    if (this.state && this.state._routerInited) {
      if (newState) Object.assign(newState, { currentRoute });
      else if (this._isMounted) this.setState({ currentRoute: currentRoute ? currentRoute.config : null });
    }
    return currentRoute ? currentRoute.config : null;
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
    }
    return ret || null;
  }

  isNull(route: any) {
    return !route || !route.path || route.subpath === '';
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this.state._routerInited) return;
    const state = { ...(this.state as S) };

    if (state._routerRoot && state.router) {
      state.router.viewRoot = this;
      state.router._handleRouteInterceptor(
        state.router.history.location,
        (ok, to) => {
          if (!ok) return;
          // this.state.router && (this.state.router.currentRoute = to);
          state.currentRoute = this._refreshCurrentRoute();
          if (this._isMounted) this.setState(Object.assign(state, { _routerInited: true }));
        },
        true,
      );
      return;
    }

    if (!this._reactInternalFiber) return;

    let parent = getHostRouterView(this);
    if (parent) {
      state._routerRoot = false;
      state._routerParent = parent.state._routerView;
      if (!state.router) state.router = parent.state.router;
      state._routerDepth = parent.state._routerDepth + 1;
    }

    if (state._routerDepth) {
      let parentMatchRoute = this._getRouteMatch(state, state._routerDepth - 1);
      state.parentRoute = parentMatchRoute ? parentMatchRoute.config : null;
      state.routes = state.parentRoute ? this._filterRoutes(state.parentRoute.config.children) : [];
      state.currentRoute = this._refreshCurrentRoute(state);
    } else console.error('[RouterView] cannot find root RouterView instance!', this);

    if (this._isMounted) this.setState(Object.assign(state, { _routerInited: true }));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  shouldComponentUpdate(nextProps: RouterViewProps, nextState: RouterViewState) {
    if (!this._isMounted) return false;
    if (this.state._routerResolving !== nextState._routerResolving) return true;
    if (this.state._routerInited !== nextState._routerInited) return true;
    if (this.state._routerDepth !== nextState._routerDepth) return true;
    if (this.state.router !== nextState.router) return true;
    if (isPropChanged(this.props, nextProps)) return true;
    if (isRouteChanged(this.state.currentRoute, nextState.currentRoute)) return true;
    if (isRoutesChanged(this.state.routes, nextState.routes)) return true;
    return false;
  }

  push(...routes: ConfigRoute[]) {
    const state = { ...this.state };
    state.routes.push(...normalizeRoutes(routes, state.parentRoute));
    if (this._isMounted) this.setState(state);
    return state.routes;
  }

  splice(idx: number, len: number, ...routes: ConfigRoute[]) {
    const state = { ...this.state };
    state.routes.splice(idx, len, ...normalizeRoutes(routes, state.parentRoute));
    if (this._isMounted) this.setState(state);
    return state.routes;
  }

  indexOf(route: string | ConfigRoute) {
    if (typeof route === 'string') route = { path: route } as ConfigRoute;
    const { routes } = this.state;
    return routes.findIndex(r => r.path === (route as ConfigRoute).path);
  }

  remove(route: string | ConfigRoute) {
    if (typeof route === 'string') route = { path: route } as ConfigRoute;
    const { routes } = this.state;
    const index = this.indexOf(route);
    if (~index) routes.splice(index, 1);
    if (this._isMounted) this.setState({ routes });
    return ~index ? route : undefined;
  }

  getComponent(currentRoute: ConfigRoute | null, excludeProps?: Partial<any>) {
    if (!currentRoute) return null;

    const { routes, router } = this.state;
    const { container, children, ...props } = this.props;
    const { query = {}, params } = ((router && router.currentRoute) || {});

    const targetExcludeProps = this.target.defaultProps.excludeProps || RouterView.defaultProps.excludeProps || [];
    (excludeProps || targetExcludeProps).forEach((key: string) => delete (props as any)[key]);

    return renderRoute(currentRoute, routes, props,
      children,
      {
        name: this.name,
        query,
        params,
        container,
        ref: this._updateRef
      });
  }

  renderCurrent(currentRoute: ConfigRoute | null) {
    if (this.isNull(currentRoute)) return this.props.children || null;
    return this.getComponent(currentRoute);
  }

  render() {
    if (!this.state._routerInited) return this._resolveFallback();

    let ret = this.renderCurrent(this.state.currentRoute);

    if (this.state._routerResolving) {
      ret = React.createElement(React.Fragment, {}, ret, this._resolveFallback());
    }

    return ret;
  }

}

RouterView.defaultProps = {
  excludeProps: ['_updateRef', 'router', 'excludeProps']
};

export {
  RouterView as RouterViewComponent
};

export default React.forwardRef((
  props: any,
  ref: any
) => React.createElement(RouterView, {
  ...props,
  _updateRef: ref
}));
