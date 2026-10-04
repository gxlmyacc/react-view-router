import { normalizeRoutes } from 'react-view-router';
import Overview, { RedirectTarget } from './Overview';
import LoopTargetPage from './LoopTargetPage';

export default normalizeRoutes([
  { path: '/', index: 'overview' },
  { path: 'overview', component: Overview },
  { path: 'legacy', redirect: 'replacement' },
  { path: 'replacement', component: RedirectTarget },
  { path: 'loop-a', component: LoopTargetPage, exact: true, redirect: 'loop-b' },
  { path: 'loop-b', component: LoopTargetPage, exact: true, redirect: 'loop-c' },
  { path: 'loop-c', component: LoopTargetPage, exact: true, redirect: 'loop-a' },
]);
