import React from 'react';
import ReactViewRouter from './router';
import { RouterViewComponent } from './router-view';
declare const RouterContext: React.Context<ReactViewRouter | null>;
declare const RouterViewContext: React.Context<RouterViewComponent<import("./router-view").RouterViewProps, import("./router-view").RouterViewState, any> | null>;
export { RouterContext, RouterViewContext };
