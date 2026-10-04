import React from 'react';
import { RouterViewComponent, RouterViewProps, RouterViewState, Route } from '../..';

import './router-view.css';

type TransitionName = 'slide' | 'slide-up' | 'slide-down' | 'fade' | 'fade-slide' | 'zoom' | 'fade-through' | 'carousel' | 'none' | '';

interface TransitionRouterViewProps extends RouterViewProps {
  transition?: TransitionName | {
    name: TransitionName,
    zIndex?: number,
    containerStyle?: React.CSSProperties,
    containerTag?: keyof HTMLElementTagNameMap | React.ComponentType | React.ForwardRefExoticComponent<any>
  },
  transitionPrefix?: string,
  /** Total duration of a page transition in milliseconds; defaults to 300. */
  transitionDuration?: number,
  transitionZIndex?: number,
  transitionFallback?: TransitionName|((to: Route) => TransitionName),
  routerView?: RouterViewComponent,
  containerStyle?: React.CSSProperties,


}

declare const RouterViewTransition: React.ForwardRefExoticComponent<
  TransitionRouterViewProps
  & React.RefAttributes<RouterViewComponent<TransitionRouterViewProps, RouterViewState, any>
  >
>;

export { TransitionName, TransitionRouterViewProps };

export default RouterViewTransition;
