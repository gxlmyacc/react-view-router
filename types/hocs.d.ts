import React from 'react';
declare function withRouter(comp: React.ComponentType, { withRoute }?: {
    withRoute?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withRoute(comp: React.ComponentType, { withRouter }?: {
    withRouter?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withRouterView(comp: React.ComponentType): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withMatchedRouteIndex(comp: React.ComponentType, { withMatchedRoute }?: {
    withMatchedRoute?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare function withMatchedRoute(comp: React.ComponentType, { withMatchedRouteIndex }?: {
    withMatchedRouteIndex?: boolean | undefined;
}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export { withRouter, withRoute, withRouterView, withMatchedRouteIndex, withMatchedRoute };
