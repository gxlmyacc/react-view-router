import React from 'react';
import {
  renderRoute, normalizeRoute, normalizeRoutes, isFunction,
  isRouteChanged, isRoutesChanged, isPropChanged,
  getHostRouterView
} from './util';

class RouterView extends React.Component {

  constructor(props) {
    super(props);
    const router = props && props.router;
    const depth = (props && props.depth) ? Number(props.depth) : 0;
    const state = {
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
    this.state = state;
    this.target = new.target;

    this._updateRef = this._updateRef.bind(this);
    this._filterRoutes = this._filterRoutes.bind(this);
  }

  get name() {
    return this.props.name || 'default';
  }

  _updateRef(ref) {
    let currentRoute = this.state.currentRoute;
    if (currentRoute) currentRoute.componentInstances[this.name] = ref;
    if (this.props && this.props._updateRef) this.props._updateRef(ref);
    if (this._isMounted) this.setState({ currentRoute });
  }

  _filterRoutes(routes, state) {
    const { name, filter } = this.props;
    let ret = routes && routes.filter(r => {
      if (r.config) r = r.config;
      const hasName = name && name !== 'default';
      if (r.redirect || r.index) return hasName ? name === r.name : !r.name;
      return hasName
        ? (r.components && r.components[name])
        : r.component || (r.components && r.components.default);
    });
    if (filter) ret = filter(ret, state);
    return ret;
  }

  _getRouteMatch(state, depth = 0) {
    if (!state) state = this.state;
    const matched = (state.router.currentRoute && state.router.currentRoute.matched) || [];
    return matched.length > depth ? matched[depth] : null;
  }

  _refreshCurrentRoute(state, newState) {
    if (!state) state = this.state;
    let currentRoute = this._getRouteMatch(state, state._routerDepth);
    if (!currentRoute) {
      currentRoute = state.router.createMatchedRoute(
        normalizeRoute({ path: '' }, state.parentRoute, state._routerDepth),
        state.parentRoute
      );
      state.router.currentRoute && state.router.currentRoute.matched.push(currentRoute);
    } else if (!currentRoute || currentRoute.redirect) currentRoute = null;

    if (currentRoute) currentRoute.viewInstances[this.name] = this;
    if (this.state && this.state._routerInited) {
      if (newState) Object.assign(newState, { currentRoute });
      else if (this._isMounted) this.setState({ currentRoute });
    }
    return currentRoute;
  }

  _updateResolving(resolving) {
    if (this._isMounted) this.setState({ _routerResolving: Boolean(resolving) });
  }

  _resolveFallback() {
    let fallback = this.props.fallback;
    if (isFunction(fallback)) {
      fallback = fallback({
        parentRoute: this.state.parentRoute,
        currentRoute: this.state.currentRoute,
        inited: this.state._routerInited,
        resolving: this.state._routerResolving,
        depth: this.state._routerDepth
      });
    }
    return fallback || null;
  }

  isNull(route) {
    return !route || !route.path || route.subpath === '';
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this.state._routerInited) return;
    const state = { ...this.state };

    if (state._routerRoot && state.router) {
      state.router.viewRoot = this;
      state.router._handleRouteInterceptor(
        state.router.history.location,
        (ok, to) => {
          if (!ok) return;
          this.state.router && (this.state.router.currentRoute = to);
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
      state.parentRoute = this._getRouteMatch(state, state._routerDepth - 1);
      state.routes = state.parentRoute ? this._filterRoutes(state.parentRoute.config.children) : [];
      state.currentRoute = this._refreshCurrentRoute(state);
    } else console.error('[RouterView] cannot find root RouterView instance!', this);

    if (this._isMounted) this.setState(Object.assign(state, { _routerInited: true }));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  shouldComponentUpdate(nextProps, nextState) {
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

  push(...routes) {
    const state = { ...this.state };
    state.routes.push(...normalizeRoutes(routes, state.parentRoute));
    if (this._isMounted) this.setState(state);
    return state.routes;
  }

  splice(idx, len, ...routes) {
    const state = { ...this.state };
    state.routes.splice(idx, len, ...normalizeRoutes(routes, state.parentRoute));
    if (this._isMounted) this.setState(state);
    return state.routes;
  }

  indexOf(route) {
    if (typeof route === 'string') route = { path: route };
    const { routes } = this.state;
    return routes.findIndex(r => r.path === route.path);
  }

  remove(route) {
    if (typeof route === 'string') route = { path: route };
    const { routes } = this.state;
    const index = this.indexOf(route);
    if (~index) routes.splice(index, 1);
    if (this._isMounted) this.setState({ routes });
    return ~index ? route : undefined;
  }

  getComponent(currentRoute, excludeProps) {
    const { routes } = this.state;
    const { container, children, ...props } = this.props;
    const { query, params } = this.state.router.currentRoute;

    const targetExcludeProps = this.target.defaultProps.excludeProps || RouterView.defaultProps.excludeProps || [];
    (excludeProps || targetExcludeProps).forEach(key => delete props[key]);

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

  renderCurrent(currentRoute) {
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

export default React.forwardRef((props, ref) => React.createElement(RouterView, {
  ...props,
  _updateRef: ref
}));
