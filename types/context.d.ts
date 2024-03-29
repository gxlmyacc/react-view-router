import React from 'react';
import ReactViewRouter from './router';
import { RouterViewComponent } from './router-view';
import { REACT_VIEW_ROUTER_GLOBAL } from './global';
declare const RouterContext: React.Context<ReactViewRouter | null>;
declare const RouterViewContext: React.Context<RouterViewComponent<import("./router-view").RouterViewProps, import("./router-view").RouterViewState, any> | null>;
export { RouterContext, RouterViewContext, REACT_VIEW_ROUTER_GLOBAL };
