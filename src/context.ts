import React from 'react';
import ReactViewRouter from './router';
import { RouterViewComponent } from './router-view';
import { REACT_VIEW_ROUTER_GLOBAL } from './global';

const RouterContext = REACT_VIEW_ROUTER_GLOBAL.contexts.RouterContext || React.createContext<ReactViewRouter|null>(null);
const RouterViewContext = REACT_VIEW_ROUTER_GLOBAL.contexts.RouterViewContext || React.createContext<RouterViewComponent|null>(null);

if (!REACT_VIEW_ROUTER_GLOBAL.contexts.RouterContext) REACT_VIEW_ROUTER_GLOBAL.contexts.RouterContext = RouterContext;
if (!REACT_VIEW_ROUTER_GLOBAL.contexts.RouterViewContext) REACT_VIEW_ROUTER_GLOBAL.contexts.RouterViewContext = RouterViewContext;

export {
  RouterContext,
  RouterViewContext,
  REACT_VIEW_ROUTER_GLOBAL
};
