import React from 'react';
import { ReactAllComponentType } from './types';
declare function withRouter(comp: ReactAllComponentType, { withRoute }?: {
    withRoute?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withRoute(comp: ReactAllComponentType, { withRouter }?: {
    withRouter?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withRouterView(comp: ReactAllComponentType): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withMatchedRouteIndex(comp: ReactAllComponentType, { withMatchedRoute }?: {
    withMatchedRoute?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withMatchedRoute(comp: ReactAllComponentType, { withMatchedRouteIndex }?: {
    withMatchedRouteIndex?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export { withRouter, withRoute, withRouterView, withMatchedRouteIndex, withMatchedRoute };
