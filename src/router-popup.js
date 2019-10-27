import React from 'react';
import Dialog from 'rmc-dialog';
import { Swipeable } from 'react-swipeable';
import { RouterView } from './router-view';
import { renderRoute } from './util';
import config from './config';
import '../style/router-popup.css';

class RouterPopup extends RouterView {

  constructor(props) {
    super(props);
    this.isSwiping = null;
    this.state.popup = false;
    this.state.prevRoute = null;
    this._handleAnimationEnd = this._handleAnimationEnd.bind(this);
    this._handleSwipeMove = this._handleSwipeMove.bind(this);
    this._handleSwipeEnd = this._handleSwipeEnd.bind(this);
  }

  _refreshCurrentRoute(state) {
    if (!state) state = this.state;
    const prevRoute = state.currentRoute;
    const newState = {};
    const currentRoute = super._refreshCurrentRoute(state, newState);
    let popup;
    if (this.isNull(prevRoute) && !this.isNull(currentRoute)) popup = true;
    if (!this.isNull(prevRoute) && this.isNull(currentRoute)) popup = false;
    if (popup !== undefined && this.state.popup !== popup) {
      newState.popup = popup;
      if (!popup && this.props.transitionName) newState.prevRoute = prevRoute;
    }

    if (this.state && this.state._routerInited) this.setState(newState);
    else Object.assign(state, newState);

    return currentRoute;
  }

  _handleSwipeMove(event) {
    if (!this.dialog) return;
    if (this.isSwiping === null) {
      this.isSwiping = event.dir === 'Right';
      if (!this.isSwiping) return;
    }
    if (this.isSwiping === false) return;

    const bodyContent = this.dialog.bodyRef.parentElement;
    bodyContent.style.webkitTransform = bodyContent.style.transform = `translateX(${-event.deltaX}px)`;
  }

  _handleSwipeEnd(event) {
    if (this.isSwiping && -event.deltaX > this.props.touchThreshold) {
      const bodyContent = this.dialog.bodyRef.parentElement;
      const viewLength = bodyContent.getBoundingClientRect().width;
      bodyContent.classList.add('swiped');
      let fn = null;
      let actionClass = '';
      if (-event.deltaX > (viewLength / 2)) {
        actionClass = 'swipe-hide';
        fn = () => this.state.router.back();
      } else actionClass = 'swipe-restore';
      bodyContent.style.webkitTransform = bodyContent.style.transform = '';
      if (actionClass) bodyContent.classList.add(actionClass);
      setTimeout(() => {
        fn && fn();
        bodyContent.classList.remove('actionClass');
        bodyContent.classList.remove('swiped');
      }, this.delay);
    }
    this.isSwiping = null;
  }

  _handleAnimationEnd() {
    if (!this.state.popup) this.setState({ prevRoute: null });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.popup !== nextState.popup) return true;
    if (this.state.prevRoute !== nextState.prevRoute) return true;
    return super.shouldComponentUpdate(nextProps, nextState);
  }

  renderCurrent(currentRoute) {
    const { routes } = this.state;
    // eslint-disable-next-line
    const { _updateRef, router, container: oldContainer, prefixCls, transitionName, zIndexStart,
      children, touchBack, ...props
    } = this.props;
    const { popup, prevRoute, bodyClassName, bodyStyle } = this.state;
    const { query, params } = this.state.router.currentRoute || {};

    let ret = renderRoute(!popup ? prevRoute : currentRoute, routes, props,
      children,
      {
        name: this.name,
        query,
        params,
        container: comp => {
          if (oldContainer) comp = oldContainer(comp);
          if (touchBack && popup && this.state.router && !this.isNull(this.state.router.prevRoute)) {
            comp = React.createElement(Swipeable, {
              onSwiping: this._handleSwipeMove,
              onSwiped: this._handleSwipeEnd,
            }, comp);
          }
          comp = React.createElement(Dialog, {
            ref: el => this.dialog = (el && el._component),
            prefixCls,
            className: bodyClassName,
            transitionName,
            closable: false,
            bodyStyle,
            visible: Boolean(popup && comp),
            zIndex: config.zIndexStart + currentRoute.depth * config.zIndexStep,
            onClose: () => transitionName && setTimeout(this._handleAnimationEnd, this.delay)
          }, comp);
          return comp;
        },
        ref: this._updateRef
      });

    return ret;
  }

}

RouterPopup.defaultProps = {
  prefixCls: 'rvr-route-popup',
  transitionName: 'rvr-slide-right',
  delay: 200,
  touchBack: true,
  touchThreshold: 10,
};

export default React.forwardRef((props, ref) => React.createElement(RouterPopup, {
  ...props,
  _updateRef: ref
}));
