import React, { StyleHTMLAttributes } from 'react';
import { RouterViewComponent, RouterView, RouterViewProps, RouterViewState } from '../..';

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
  routerView?: RouterViewComponent | RouterView,
  containerStyle?: StyleHTMLAttributes<HTMLDivElement>,
}

declare const RouterViewTransition: React.ForwardRefExoticComponent<
  Pick<TransitionRouterViewProps, keyof TransitionRouterViewProps>
  & React.RefAttributes<RouterViewComponent<TransitionRouterViewProps, RouterViewState, any>
  >
>;

export { TransitionRouterViewProps };

export default RouterViewTransition;
