import React, { ReactNode } from 'react';
import {
  RouterViewComponent,
  renderRoute,
  config,
  isFunction,
  MatchedRoute,
  RouterViewProps,
  RouterViewState,
  RouterViewDefaultProps,
} from 'react-view-router';

import Drawer from './drawer';

import '../style/drawer.css';

export interface RouterDrawerProps extends RouterViewProps {
  [key: string]: any
}

export interface RouterDrawerState extends RouterViewState {
  openDrawer?: boolean,
  _routerDrawer?: boolean,
  prevRoute?: MatchedRoute | null,
}

export interface RouterDrawerDefaultProps extends RouterViewDefaultProps {
  prefixCls: string,
  position: string,
  touch: boolean,
}

class RouterDrawer<
  P extends RouterDrawerProps = RouterDrawerProps,
  S extends RouterDrawerState = RouterDrawerState,
  SS = any
> extends RouterViewComponent<P, S, SS> {

  drawer?: Drawer | null;

  needAnimation: boolean;

  static defaultProps: RouterDrawerDefaultProps;

  constructor(props: P) {
    super(props);
    this.needAnimation = false;

    Object.assign(this.state, {
      openDrawer: false,
      prevRoute: null,
      _routerDrawer: true
    });
    this._handleClose = this._handleClose.bind(this);
    this._handleAnimationEnd = this._handleAnimationEnd.bind(this);
  }

  _refreshCurrentRoute(state?: S, newState?: any, callback?: () => void) {
    if (!state) state = this.state;
    const prevRoute = state.currentRoute;

    if (!newState) newState = { openDrawer: false };
    else newState.openDrawer = false;

    const currentRoute = super._refreshCurrentRoute(state, newState, callback);
    let openDrawer;
    if (this.isNull(prevRoute) && !this.isNull(currentRoute)) {
      let r = state._routerParent && state._routerParent.state.currentRoute;
      r && Object.keys(r.componentInstances).forEach(key => {
        const c = r && r.componentInstances[key];
        if (c && c.componentWillUnactivate) c.componentWillUnactivate();
      });
      openDrawer = true;
    }
    if (!this.isNull(prevRoute) && this.isNull(currentRoute)) {
      let r = state._routerParent && state._routerParent.state.currentRoute;
      r && Object.keys(r.componentInstances).forEach(key => {
        const c = r && r.componentInstances[key];
        if (c && c.componentDidActivate) c.componentDidActivate();
      });
      openDrawer = false;
    }
    if (openDrawer !== undefined && this.state.openDrawer !== openDrawer) {
      newState.openDrawer = openDrawer;
      if (!openDrawer
        && this.props.position
        && !this.isNull(this.state.prevRoute)) newState.prevRoute = prevRoute;
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
    if (router) {
      if (parentRoute && router.currentRoute && router.currentRoute.path !== parentRoute.path) router.back();
    }
    this.setState({ openDrawer: false });
  }

  getZindex() {
    const currentRoute = this.state.currentRoute;
    if (!currentRoute) return config.zIndexStart;
    const { zIndex } = this.props;
    if (zIndex !== undefined) {
      if (isFunction(zIndex)) return zIndex(currentRoute, { config, view: this });
      return zIndex;
    }
    return config.zIndexStart + currentRoute.depth * config.zIndexStep;
  }

  shouldComponentUpdate(nextProps: P, nextState: S) {
    if (this.state.openDrawer !== nextState.openDrawer) return true;
    if (this.state.prevRoute !== nextState.prevRoute) return true;
    return super.shouldComponentUpdate(nextProps, nextState);
  }

  renderCurrent(currentRoute: MatchedRoute | null) {
    const { routes } = this.state;
    if (!this.state.router || !currentRoute) return null;

    const { children, props } = this.getComponentProps();
    const { openDrawer, prevRoute } = this.state;
    const { query, params } = this.state.router.currentRoute || {};

    Object.defineProperty(props, 'drawer', {
      get() {
        return this.drawer;
      },
      configurable: true
    });

    let ret = renderRoute(
      !openDrawer ? prevRoute : currentRoute,
      routes,
      props,
      children,
      {
        name: this.name,
        query,
        params,
        ref: this._updateRef
      }
    );

    return ret;
  }

  renderContainer(current: ReactNode|null, currentRoute: MatchedRoute | null): ReactNode | null {
    let result = super.renderContainer(current, currentRoute);
    if (this.isNull(currentRoute)) return result;

    const {
      prefixCls, position, drawerClassName, touch
    } = this.props;
    const { openDrawer } = this.state;

    let needAnimation = this.state.router && !this.isNull(this.state.router.prevRoute);
    if (!openDrawer) needAnimation = this.needAnimation && needAnimation;
    this.needAnimation = Boolean(needAnimation);

    result = React.createElement(Drawer, {
      ref: (el: Drawer | null) => this.drawer = el,
      prefixCls,
      className: drawerClassName,
      touch: touch && needAnimation,
      transitionName: (needAnimation && position) ? `rvr-slide-${position}` : '',
      open: Boolean(openDrawer && result),
      zIndex: this.getZindex(),
      onAnimateLeave: this._handleAnimationEnd,
      onClose: this._handleClose,
    } as any, result);

    return result;
  }

}

RouterDrawer.defaultProps = {
  ...RouterViewComponent.defaultProps,
  prefixCls: 'rvr-route-drawer',
  position: 'right',
  touch: true,
  excludeProps: [
    ...RouterViewComponent.defaultProps.excludeProps,
    'drawerClassName', 'touch', 'prefixCls', 'position', 'zIndexStart', 'delay'
  ]
};

export default React.forwardRef((props, ref) => React.createElement(RouterDrawer as any, {
  ...props,
  _updateRef: ref
}));
