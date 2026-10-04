import { normalizeRoutes } from 'react-view-router';
import ScrollPage from './ScrollPage';
import PreviewPage from './PreviewPage';

export default normalizeRoutes([
  { path: '/', index: 'list' },
  // A scoped selector works with either the explicit or the Transition container.
  { path: 'list', component: ScrollPage, meta: { savePosition: '.save-position-scroll' } },
  { path: 'preview', component: PreviewPage },
]);
