import React from 'react';
import { Router } from 'react-router-dom';
import { renderRoutes, normalizeRoutes } from './util';

class RouterView extends React.Component {
  constructor(props) {
    super(props);
    const router = props && props.router;
    const depth = Number(props && props.depth) || 0;
    const state = {
      _routerView: this,
      _routerRoot: true,
      _routerParent: null,
      _routerDepth: depth,
      _routerInited: false,

      router,
      parentRoute: null,
      currentRoute: null,
      routes: router ? this.filterRoutes(router.routes) : [],
    };
    this.state = state;

    this._updateRef = this._updateRef.bind(this);
    this.filterRoutes = this.filterRoutes.bind(this);
  }

  _updateRef(ref) {
    let currentRoute = this._refreshCurrentRoute();
    if (currentRoute) currentRoute.componentInstance = ref;
    if (this.props && this.props._updateRef) this.props._updateRef(ref);
    if (currentRoute.fullPath !== this.state.currentRoute.fullPath) this.setState({ currentRoute });
  }

  filterRoutes(routes) {
    const { name } = this.props;
    return routes.filter(r => {
      if (r.config) r = r.config;
      const hasName = name && name !== 'default';
      if (r.redirect) return hasName ? name === r.name : !r.name;
      return hasName
        ? (r.components && r.components[name])
        : r.component || (r.components && r.components.default);
    });
  }

  _refreshCurrentRoute(state) {
    if (!state) state = this.state;
    const matched = state.router.currentRoute.matched;
    const ret = matched.length > state._routerDepth
      ? matched[state._routerDepth]
      : null;
    if (ret) ret.viewInstance = this;
    return ret;
  }

  async componentDidMount() {
    if (this.state._routerInited) return;
    const state = { ...this.state, _routerInited: true };
    const props = this.props || {};
    if (props.depth === undefined && this._reactInternalFiber) {
      let parent = this._reactInternalFiber.return;
      while (parent) {
        const memoizedState = parent.memoizedState;
        if (memoizedState && memoizedState._routerView) {
          state._routerRoot = false;
          state._routerParent = memoizedState._routerView;
          if (!state.router) state.router = memoizedState.router;
          state._routerDepth = memoizedState._routerDepth + 1;
          break;
        }
        parent = parent.return;
      }
    }

    if (!state.routes.length) {
      const matched = state.router.currentRoute.matched;
      state.currentRoute = this._refreshCurrentRoute(state);
      if (state._routerDepth) {
        // state.router.updateRoute();
        state.parentRoute = matched.length >= state._routerDepth
          ? matched[state._routerDepth - 1]
          : null;
        state.routes = state.parentRoute ? this.filterRoutes(state.parentRoute.config.children) : [];
      }
    }

    if (state._routerRoot && state.router) {
      state.router._handleRouteInterceptor(state.router.location, ok => ok && this.setState(state), true);
    } else this.setState(state);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !nextProps.location || (nextProps.location.pathname !== this.props.location.pathname);
  }

  push(routes) {
    const state = { ...this.state };
    state.routes.push(...normalizeRoutes(routes));
    this.setState(state);
  }

  splice(index, routes) {
    const state = { ...this.state };
    state.routes.splice(index, routes.length, ...normalizeRoutes(routes));
    this.setState(state);
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
    this.setState({ routes });
  }

  render() {
    const { routes, router, _routerRoot, _routerInited } = this.state;
    // eslint-disable-next-line
    const { _updateRef, ...props } = this.props || {};
    if (!_routerInited) return props.fallback || null;
    const { query, params } = router.currentRoute;

    const _render = () => renderRoutes(routes,
      {
        ...props,
        parent: this,
      },
      { },
      { name: props.name, query, params, ref: this._updateRef });
    let ret = null;
    if (_routerRoot) {
      ret = React.createElement(Router, { history: router }, _render());
    } else ret = _render();

    return ret;
  }
}

export default React.forwardRef((props, ref) => React.createElement(RouterView, {
  ...props,
  _updateRef: ref
}));
