import { normalizeRoutes } from 'react-view-router';
import { HistoryFinish, HistoryStart, IframeHistory } from './pages';

export default normalizeRoutes([
  { path: '/', index: 'start' },
  { path: 'start', component: HistoryStart },
  { path: 'iframe', component: IframeHistory },
  { path: 'finish', component: HistoryFinish },
]);
