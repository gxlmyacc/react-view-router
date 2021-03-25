import React from 'react';
import ReactViewRouter from './router';
import { RouterViewComponent } from './router-view';

const RouterContext = React.createContext<ReactViewRouter|null>(null);
const RouterViewContext = React.createContext<RouterViewComponent|null>(null);

export {
  RouterContext,
  RouterViewContext
};
