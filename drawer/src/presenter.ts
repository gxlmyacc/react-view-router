import React from 'react';
import { config } from '../..';
import type { RouterViewPresenterProps } from '../..';
import Drawer from './drawer';
import RouterDrawerContext from './context';

interface PresenterState {
  routePath: string | null;
  open: boolean;
  displayed: React.ReactNode;
}

/** Places a child route in a Drawer without changing RouterView's matching or KeepAlive logic. */
export default class ComposedRouterDrawerPresenter extends React.Component<RouterViewPresenterProps, PresenterState> {

  static contextType = RouterDrawerContext;

  constructor(props: RouterViewPresenterProps) {
    super(props);
    const routePath = props.view.isNull(props.route) ? null : props.route?.path || null;
    this.state = { routePath, open: Boolean(routePath), displayed: props.children };
  }

  static getDerivedStateFromProps(props: RouterViewPresenterProps, state: PresenterState): Partial<PresenterState> | null {
    const routePath = props.view.isNull(props.route) ? null : props.route?.path || null;
    if (routePath !== state.routePath) {
      return { routePath, open: Boolean(routePath), displayed: routePath ? props.children : state.displayed };
    }
    return routePath ? { displayed: props.children } : null;
  }

  componentDidUpdate(previousProps: RouterViewPresenterProps, previousState: PresenterState): void {
    const wasOpen = previousState.open;
    const isOpen = this.state.open;
    if (wasOpen === isOpen) return;
    const { router, view, route } = this.props;
    const parentRoute = view.state.parentRoute;
    if (!parentRoute) return;
    const type = isOpen ? 'deactivate' : 'activate';
    const event = {
      type,
      router,
      source: view,
      target: parentRoute,
      to: view.isNull(route) ? null : route,
      from: view.isNull(previousProps.route) ? null : previousProps.route,
    } as const;
    const parents = new Set(Object.values(parentRoute.viewInstances));
    if (view.state.parent) parents.add(view.state.parent);
    parents.forEach((parent) => {
      if (!parent?._isMounted) return;
      parent._notifyViewActivation(event);
    });
  }

  handleClose = (): void => {
    const { router, view } = this.props;
    const parentPath = view.state.parentRoute?.path;
    if (parentPath && router.currentRoute?.path !== parentPath) router.back();
  };

  handleLeave = (): void => {
    if (!this.state.open) this.setState({ displayed: null });
  };

  render(): React.ReactNode {
    const { route, view } = this.props;
    const options = this.context;
    const zIndex = view.isNull(route)
      ? config.zIndexStart
      : typeof options.zIndex === 'function'
        ? options.zIndex(route!, { config, view })
        : options.zIndex === undefined
          ? config.zIndexStart + (route?.depth || view.state.depth) * config.zIndexStep
          : options.zIndex;

    return React.createElement(Drawer, {
      prefixCls: options.prefixCls,
      position: options.position,
      mask: options.mask,
      maskClosable: options.maskClosable,
      maskTransitionName: `${options.prefixCls}-fade`,
      maskStyle: { animationDuration: `${options.delay}ms` },
      style: {
        width: options.width,
        height: options.height,
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        animationDuration: `${options.delay}ms`,
      },
      className: options.drawerClassName,
      portalContainer: options.portalContainer,
      touch: options.touch,
      delay: options.delay,
      transitionName: options.position === 'center' ? 'rvr-drawer-center' : options.position ? `rvr-slide-${options.position}` : '',
      open: this.state.open,
      zIndex,
      onClose: this.handleClose,
      onAnimateLeave: this.handleLeave,
    }, this.state.displayed);
  }

}
