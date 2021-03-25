import React from 'react';
import ReactViewRouter from './router';
import { RouterViewComponent } from './router-view';
import { RouterContext, RouterViewContext } from './context';

function withRouter(comp: React.ComponentType, { withRoute = false } = {}) {
  return React.forwardRef((props, ref: any) => (
    React.createElement<any>(RouterContext.Consumer, {}, (router: ReactViewRouter|null) => {
      const newProps: any = {
        ...props,
        ref,
        router: router || null
      };
      if (withRoute) newProps.route = router ? router.currentRoute : null;
      return React.createElement<any>(comp, newProps, props.children);
    })
  ));
}

function withRoute(comp: React.ComponentType, { withRouter = false } = {}) {
  return React.forwardRef((props, ref: any) => (
    React.createElement<any>(RouterContext.Consumer, {}, (router: ReactViewRouter|null) => {
      const newProps: any = {
        ...props,
        ref,
        route: router ? router.currentRoute : null
      };
      if (withRouter) newProps.router = router || null;
      return React.createElement<any>(comp, newProps, props.children);
    })
  ));
}

function withRouterView(comp: React.ComponentType) {
  return React.forwardRef((props, ref: any) => (
    React.createElement<any>(RouterViewContext.Consumer, {}, (routerView: RouterViewComponent|null) => {
      const newProps: any = {
        ...props,
        ref,
        routerView: routerView || null
      };
      return React.createElement<any>(comp, newProps, props.children);
    })
  ));
}

function withMatchedRouteIndex(comp: React.ComponentType, { withMatchedRoute = false } = {}) {
  return React.forwardRef((props, ref: any) => (
    React.createElement<any>(RouterViewContext.Consumer, {}, (routerView: RouterViewComponent|null) => {
      const matchedRouteIndex = routerView ? routerView.state._routerDepth : -1;
      const newProps: any = {
        ...props,
        ref,
        matchedRouteIndex
      };
      if (withMatchedRoute) newProps.matchedRoute = routerView ? routerView.state.currentRoute : null;
      return React.createElement<any>(comp, newProps, props.children);
    })
  ));
}

function withMatchedRoute(comp: React.ComponentType, { withMatchedRouteIndex = false } = {}) {
  return React.forwardRef((props, ref: any) => (
    React.createElement<any>(RouterViewContext.Consumer, {}, (routerView: RouterViewComponent|null) => {
      const newProps: any = {
        ...props,
        ref,
        matchedRoute: routerView ? routerView.state.currentRoute : null
      };
      if (withMatchedRouteIndex) newProps.matchedRouteIndex = routerView ? routerView.state._routerDepth : -1;
      return React.createElement<any>(comp, newProps, props.children);
    })
  ));
}

export {
  withRouter,
  withRoute,
  withRouterView,
  withMatchedRouteIndex,
  withMatchedRoute
};
