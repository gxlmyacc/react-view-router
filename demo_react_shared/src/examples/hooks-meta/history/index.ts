import ReactViewRouter from 'react-view-router';
import routes from '../routes';

// Route metadata is available before start(), so useRouteTitle can build the
// navigation model while basename and the shared history are still supplied
// later by the host boundary.
const router = new ReactViewRouter({ manual: true, routes });

export default router;
