import { lazyImport } from 'react-view-router';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';

const routes = [
  {
    path: '/',
    component: HomeScreen,
  },
  {
    path: '/details',
    component: lazyImport(() => Promise.resolve(DetailsScreen)),
  },
  {
    path: '/portable',
    // Native has no DOM. Optional hydration degrades to the normal client renderer.
    component: lazyImport(() => Promise.resolve(DetailsScreen), { hydrate: true }),
  },
];

export default routes;
