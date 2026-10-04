import { normalizeRoutes } from 'react-view-router';
import DraftPage from './DraftPage';
import PreviewPage from './PreviewPage';

export default normalizeRoutes([
  { path: '/', index: 'draft' },
  { path: 'draft', component: DraftPage, keepAlive: true },
  { path: 'preview', component: PreviewPage },
]);
