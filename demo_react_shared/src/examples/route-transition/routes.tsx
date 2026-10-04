import React from 'react';
import { normalizeRoutes } from 'react-view-router';
import TransitionPage from './pages';

const routes = normalizeRoutes([
  { path: '/', index: 'first' },
  {
    path: 'first',
    component: () => <TransitionPage index={1} title="First page" color="#e9f8e4" />,
  },
  {
    path: 'second',
    component: () => <TransitionPage index={2} title="Second page" color="#e3f4f0" />,
  },
  {
    path: 'third',
    component: () => <TransitionPage index={3} title="Third page" color="#edf1dd" />,
  },
]);

export default routes;
