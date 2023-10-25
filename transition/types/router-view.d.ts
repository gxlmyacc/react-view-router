import React, { StyleHTMLAttributes } from 'react';
import { RouterViewComponent, RouterViewProps, RouterViewState, RouteSavedPosition, Route } from '../..';

import './router-view.css';

type TransitionName = 'slide' | 'fade' | 'carousel' | '';

interface TransitionRouterViewProps extends RouterViewProps {
  transition?: TransitionName | {
    name: TransitionName,
    zIndex?: number,
    containerStyle?: React.HTMLAttributes<HTMLDivElement | HTMLElement>,
    containerTag?: keyof HTMLElementTagNameMap | React.ComponentType | React.ForwardRefExoticComponent<any>
  },
  transitionPrefix?: string,
  transitionZIndex?: number,
  transitionFallback?: TransitionName|((to: Route) => TransitionName),
  routerView?: RouterViewComponent,
  containerStyle?: StyleHTMLAttributes<HTMLDivElement>,

  onScrollToPosition?: (node?: HTMLElement, savedPosition: RouteSavedPosition) => void,
  onSavePosition?: (node?: HTMLElement, options: { to: Route, from: Route|null }) => RouteSavedPosition,
}

declare const RouterViewTransition: React.ForwardRefExoticComponent<
  TransitionRouterViewProps
  & React.RefAttributes<RouterViewComponent<TransitionRouterViewProps, RouterViewState, any>
  >
>;

export { TransitionRouterViewProps };

export default RouterViewTransition;
