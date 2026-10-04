import { normalizeRoutes } from 'react-view-router';
import UnauthorizedPage from './UnauthorizedPage';

export default normalizeRoutes([
  { path: '/', redirect: () => ({ path: 'unauthorized', query: { module: 'finance' } }) },
  {
    path: 'unauthorized',
    component: UnauthorizedPage,
    queryProps: ['module'],
  },
]);
