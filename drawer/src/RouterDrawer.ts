import React from 'react';
import { RouterView } from '../..';
import type { RouterViewComponent, RouterViewProps } from '../..';
import ComposedRouterDrawerPresenter from './presenter';
import RouterDrawerContext from './context';
import type { RouterDrawerOptions } from './context';

export interface RouterDrawerProps extends RouterViewProps, Partial<RouterDrawerOptions> {
  [key: string]: any;
}

// RouterView forwards its ref to the active route component, not to its own view instance.
const RouterDrawer = React.forwardRef<unknown, RouterDrawerProps>(({
  prefixCls = 'rvr-route-drawer',
  position = 'right',
  mask = true,
  maskClosable = false,
  width,
  height,
  maxWidth,
  maxHeight,
  drawerClassName,
  portalContainer,
  touch = true,
  delay = 200,
  zIndex,
  ...viewProps
}, ref) => {
  const options = React.useMemo(() => ({
    prefixCls, position, mask, maskClosable, width, height, maxWidth, maxHeight, drawerClassName, portalContainer, touch, delay, zIndex,
  }), [prefixCls, position, mask, maskClosable, width, height, maxWidth, maxHeight, drawerClassName, portalContainer, touch, delay, zIndex]);

  return React.createElement(
    RouterDrawerContext.Provider,
    { value: options },
    React.createElement(RouterView, {
      ...viewProps,
      ref: ref as React.Ref<RouterViewComponent>,
      viewPresenter: ComposedRouterDrawerPresenter,
    })
  );
});

export default RouterDrawer;
