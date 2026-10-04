import ReactViewRouter from 'react-view-router';
import routes from './routes';

export default function createAppRouter() {
  return new ReactViewRouter({
    mode: 'memory',
    pathname: '/',
    routes,
  });
}
