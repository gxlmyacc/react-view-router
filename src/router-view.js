import React from 'react';
import { Router } from 'react-router-dom';
import { renderRoutes } from './util';

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
      routes: router ? this.filterRoutes(router.routes) : [],
    };
    this.state = state;

    this._updateRef = this._updateRef.bind(this);
    this.filterRoutes = this.filterRoutes.bind(this);
  }

  _updateRef(ref) {
    const { parentRoute } = this.state;
    if (parentRoute) parentRoute.componentInstance = ref;
    if (this.props && this.props._updateRef) this.props._updateRef(ref);
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

    if (!state.routes.length && state._routerDepth) {
      // state.router.updateRoute();
      const matched = state.router.currentRoute.matched;
      state.parentRoute = matched.length > state._routerDepth
        ? matched[state._routerDepth - 1]
        : null;
      if (state.parentRoute) {
        state.parentRoute.viewInstance = this;
      }
      state.routes = state.parentRoute ? this.filterRoutes(state.parentRoute.config.children) : [];
    }

    if (state._routerRoot && state.router) {
      state.router._handleRouteInterceptor(state.router.location, ok => ok && this.setState(state));
    } else this.setState(state);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !nextProps.location || (nextProps.location.pathname !== this.props.location.pathname);
  }

  render() {
    const { routes, router, _routerRoot, _routerInited } = this.state;
    const { _updateRef, ...props } = this.props || {};
    if (!_routerInited) return props.fallback || null;
    const { query, params } = router.currentRoute;

    const _render = () => renderRoutes(routes,
      {
        ...props,
        parent: this,
        ref: _updateRef ? this._updateRef : undefined
      },
      { },
      { name: props.name, query, params });
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
