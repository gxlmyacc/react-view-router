import ReactViewRouter from 'react-view-router';
import { routes } from './routes';

const router = new ReactViewRouter({
  mode: 'browser',
  routes,
});

export default router;
