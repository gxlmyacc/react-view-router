import { normalizeRoutes } from 'react-view-router';
import { ModuleHome, Settings, UserDetails } from './pages';

export default normalizeRoutes([
  { path: '/', index: 'home' },
  { path: 'home', component: ModuleHome },
  {
    path: 'users/:userId',
    component: UserDetails,
    paramsProps: ['userId'],
    defaultProps: { propSource: 'route.defaultProps' },
    meta: { computedLabel: route => `computed:${route.path}` },
  },
  { path: 'settings', component: Settings },
]);
