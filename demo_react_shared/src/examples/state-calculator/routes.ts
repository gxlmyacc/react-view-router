import { normalizeRoutes } from 'react-view-router';
import { CalculatorForm, CalculatorHelp, CalculatorResult } from './pages';

export default normalizeRoutes([
  { path: '/', index: 'form' },
  { path: 'form', component: CalculatorForm },
  { path: 'result', component: CalculatorResult },
  { path: 'help', component: CalculatorHelp },
]);
