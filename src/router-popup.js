import React from 'react';
import Dialog from 'rmc-dialog';
import { RouterView } from './router-view';
import { renderRoute } from './util';

import '../style/router-popup.css';

class RouterPopup extends RouterView {

  constructor(props) {
    super(props);
    this.state.popup = false;
  }

  _refreshCurrentRoute(state) {
    if (!state) state = this.state;
    const prevRoute = state.currentRoute;
    const currentRoute = super._refreshCurrentRoute(state);
    if (this.isNull(prevRoute) && !this.isNull(currentRoute)) {
      if (this.state && this.state._routerInited) this.setState({ popup: true });
      else state.popup = true;
    }
    if (!this.isNull(prevRoute) && this.isNull(currentRoute)) {
      if (this.state && this.state._routerInited) this.setState({ popup: false });
      else state.popup = false;
    }
    return currentRoute;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.popup !== nextState.popup) return true;
    return super.shouldComponentUpdate(nextProps, nextState);
  }

  renderCurrent(currentRoute) {
    const { routes } = this.state;
    // eslint-disable-next-line
    const { _updateRef, container: oldContainer, prefixCls, transitionName, zIndexStart,
      router, children, ...props } = this.props;
    const { query, params } = this.state.router.currentRoute || {};

    let ret = renderRoute(currentRoute, routes, props,
      children,
      {
        name: this.name,
        query,
        params,
        container: comp => {
          if (oldContainer) comp = oldContainer(comp);
          return React.createElement(Dialog, {
            prefixCls,
            transitionName,
            closable: false,
            visible: Boolean(this.state.popup && comp),
            zIndex: zIndexStart + currentRoute.depth + 1,
          }, comp);
        },
        ref: this._updateRef
      });

    return ret;
  }

}

RouterPopup.defaultProps = {
  prefixCls: 'rvr-route-popup',
  transitionName: 'rvr-slide-right',
  zIndexStart: 0
};

export default React.forwardRef((props, ref) => React.createElement(RouterPopup, {
  ...props,
  _updateRef: ref
}));
