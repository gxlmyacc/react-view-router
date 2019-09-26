import React from 'react';
import { Router } from 'react-router-dom';
import { renderRoutes, normalizeRoutes, isFunction } from './util';
import config from './config';

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

    this._updateRef = this._updateRef.bind(this);
    this._filterRoutes = this._filterRoutes.bind(this);
  }

  get name() {
    const { name } = this.props;
    return name || 'default';
  }

  _updateRef(ref) {
    let newRoute = this._refreshCurrentRoute();
    let oldRoute = this.state.currentRoute;

    if (newRoute) {
      newRoute.componentInstances[this.name] = ref;
    }
    if (this.props && this.props._updateRef) this.props._updateRef(ref);
    if (oldRoute !== newRoute) this.setState({ currentRoute: newRoute });
  }

  _filterRoutes(routes, state) {
    const { name, filter } = this.props;
    let ret = routes && routes.filter(r => {
      if (r.config) r = r.config;
      const hasName = name && name !== 'default';
      if (r.redirect) return hasName ? name === r.name : !r.name;
      return hasName
        ? (r.components && r.components[name])
        : r.component || (r.components && r.components.default);
    });
    if (filter) ret = filter(ret);
    return ret;
  }

  _refreshCurrentRoute(state) {
    if (!state) state = this.state;
    const matched = (state.router.currentRoute && state.router.currentRoute.matched) || [];
    const ret = matched.length > state._routerDepth
      ? matched[state._routerDepth]
      : null;
    if (ret) ret.viewInstance = this;
    return ret;
  }

  _updateResolving(resolving) {
    this.setState({ _routerResolving: Boolean(resolving) });
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

  async componentDidMount() {
    if (this.state._routerInited) return;
    const state = { ...this.state };
    const props = this.props || {};
    if (props.depth === undefined && this._reactInternalFiber) {
      let parent = this._reactInternalFiber.return;
      while (parent && parent.type !== Router) {
        const memoizedState = parent.memoizedState;
        const memoizedProps = parent.memoizedProps;
        if (memoizedState && memoizedState._routerView) {
          state._routerRoot = false;
          state._routerParent = memoizedState._routerView;
          if (!state.router) state.router = memoizedState.router;
          state._routerDepth = memoizedState._routerDepth + 1;
          break;
        }
        if (!state.router
            && parent.type === Router
            && memoizedProps
            && memoizedProps.history) state.router = memoizedProps.history;
        parent = parent.return;
      }
    }

    if (!state.routes.length) {
      const matched = (state.router.currentRoute && state.router.currentRoute.matched) || [];
      state.currentRoute = this._refreshCurrentRoute(state);
      if (state._routerDepth) {
        // state.router.updateRoute();
        state.parentRoute = matched.length >= state._routerDepth
          ? matched[state._routerDepth - 1]
          : null;
        state.routes = state.parentRoute ? this._filterRoutes(state.parentRoute.config.children) : [];
      }
    }

    if (state._routerRoot && state.router) {
      state.router.viewRoot = this;
      state.router._handleRouteInterceptor(
        state.router.history.location,
        ok => ok && this.setState(Object.assign(state, { _routerInited: true })),
        true,
      );
    } else {
      this.setState(Object.assign(state, { _routerInited: true }));
    }
  }

  isRouteChanged(prev, next) {
    if (prev && next) return prev.path !== next.path;
    if ((!prev || !next) && prev !== next) return true;
    return false;
  }

  isRoutesChanged(prevs, nexts) {
    if (!prevs || !nexts) return true;
    if (prevs.length !== nexts.length) return true;
    let changed = false;
    prevs.some((prev, i) => {
      changed = this.isRouteChanged(prev, nexts[i]);
      return changed;
    });
    return changed;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state._routerResolving !== nextState._routerResolving) return true;
    if (this.state._routerInited !== nextState._routerInited) return true;
    if (this.state._routerDepth !== nextState._routerDepth) return true;
    if (this.state.router !== nextState.router) return true;
    if (this.isRouteChanged(this.state.currentRoute, nextState.currentRoute)) return true;
    if (this.isRoutesChanged(this.state.routes, nextState.routes)) return true;
    return false;
  }

  push(...routes) {
    const state = { ...this.state };
    state.routes.push(...normalizeRoutes(routes, state.parentRoute));
    this.setState(state);
    return state.routes;
  }

  splice(idx, len, ...routes) {
    const state = { ...this.state };
    state.routes.splice(idx, len, ...normalizeRoutes(routes, state.parentRoute));
    this.setState(state);
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
    this.setState({ routes });
    return ~index ? route : undefined;
  }

  render() {
    const { routes, _routerResolving, _routerInited } = this.state;
    // eslint-disable-next-line
    const { _updateRef, container, router, ...props } = this.props || {};
    if (!_routerInited) return this._resolveFallback();
    const { query, params } = this.state.router.currentRoute;

    let ret = renderRoutes(routes, config.inheritProps ? { ...props, parent: this, } : props,
      { },
      {
        name: this.name,
        query,
        params,
        container,
        ref: this._updateRef
      });
    if (_routerResolving) ret = React.createElement(React.Fragment, {}, ret, this._resolveFallback());
    else if (!ret) ret = this._resolveFallback();
    return ret;
  }

}

export default React.forwardRef((props, ref) => {
  let ret = React.createElement(RouterView, {
    ...props,
    _updateRef: ref
  });
  if (props.router) {
    ret = React.createElement(Router, {
      history: props.router,
    }, ret);
  }
  return ret;
});
