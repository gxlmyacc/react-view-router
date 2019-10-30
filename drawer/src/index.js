import React from 'react';
import { RouterViewComponent, renderRoute, config, isFunction } from 'react-view-router';
import Drawer from './drawer';

import '../style/drawer.css';

class RouterDrawer extends RouterViewComponent {

  constructor(props) {
    super(props);
    this.state.openDrawer = false;
    this.state.prevRoute = null;
    this.state._routerDrawer = true;
    this._handleClose = this._handleClose.bind(this);
    this._handleAnimationEnd = this._handleAnimationEnd.bind(this);
  }

  _refreshCurrentRoute(state) {
    if (!state) state = this.state;
    const prevRoute = state.currentRoute;
    const newState = {};
    const currentRoute = super._refreshCurrentRoute(state, newState);
    let openDrawer;
    if (this.isNull(prevRoute) && !this.isNull(currentRoute)) openDrawer = true;
    if (!this.isNull(prevRoute) && this.isNull(currentRoute)) openDrawer = false;
    if (openDrawer !== undefined && this.state.openDrawer !== openDrawer) {
      newState.openDrawer = openDrawer;
      if (!openDrawer && this.props.position) newState.prevRoute = prevRoute;
    }

    if (this.state && this.state._routerInited) this.setState(newState);
    else Object.assign(state, newState);

    return currentRoute;
  }

  _handleAnimationEnd() {
    if (!this.props.position) return;
    if (!this.state.openDrawer) this.setState({ prevRoute: null });
  }

  _handleClose() {
    const { router, parentRoute } = this.state;
    if (parentRoute && router.currentRoute.path !== parentRoute.path) this.state.router.back();
    this.setState({ openDrawer: false });
  }

  getZindex() {
    const currentRoute = this.state.currentRoute;
    const { zIndex } = this.props;
    if (zIndex !== undefined) {
      if (isFunction(zIndex)) return zIndex(currentRoute, { config, view: this });
      return zIndex;
    }
    return config.zIndexStart + currentRoute.depth * config.zIndexStep;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.openDrawer !== nextState.openDrawer) return true;
    if (this.state.prevRoute !== nextState.prevRoute) return true;
    return super.shouldComponentUpdate(nextProps, nextState);
  }

  renderCurrent(currentRoute) {
    const { routes } = this.state;
    // eslint-disable-next-line
    const { _updateRef, router, container: oldContainer, prefixCls, position, zIndexStart,
      // eslint-disable-next-line
      swipeDelay, delay, touchThreshold,
      drawerClassName, children, touch, ...props
    } = this.props;
    const { openDrawer, prevRoute } = this.state;
    const { query, params } = this.state.router.currentRoute || {};

    Object.defineProperty(props, 'drawer', {
      get() {
        return this.drawer;
      },
      configurable: true
    });

    let ret = renderRoute(!openDrawer ? prevRoute : currentRoute, routes, props,
      children,
      {
        name: this.name,
        query,
        params,
        container: comp => {
          if (oldContainer) comp = oldContainer(comp);
          comp = React.createElement(Drawer, {
            ref: el => this.drawer = el,
            prefixCls,
            className: drawerClassName,
            touch: touch && !this.isNull(this.state.router.prevRoute),
            transitionName: position ? `rvr-slide-${position}` : '',
            open: Boolean(openDrawer && comp),
            zIndex: this.getZindex(),
            onAnimateLeave: this._handleAnimationEnd,
            onClose: this._handleClose,
          }, comp);
          return comp;
        },
        ref: this._updateRef
      });

    return ret;
  }

}

RouterDrawer.defaultProps = {
  prefixCls: 'rvr-route-drawer',
  position: 'right',
  touch: true,
};

export default React.forwardRef((props, ref) => React.createElement(RouterDrawer, {
  ...props,
  _updateRef: ref
}));
