import { normalizeRoutes } from 'react-view-router';
import HomePageRoute from './HomePageRoute';
import DetailsPage from './DetailsPage';
import ContentPage from './ContentPage';
import InnerPage from './InnerPage';

export default normalizeRoutes([
  { path: '/', index: 'home' },
  {
    path: 'home',
    component: HomePageRoute,
    children: [{
      path: 'details', component: DetailsPage, children: [
        { path: 'content', component: ContentPage, children: [{ path: 'inner', component: InnerPage }] },
      ]
    }],
  },
]);
