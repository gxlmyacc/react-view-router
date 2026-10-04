import React, { useEffect } from 'react';
import { RouterView, useManualRouter } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import router from './history';
import routes from './routes';
import './App.scss?scoped';

interface StateCalculatorAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function StateCalculatorApp({ basename, mode }: StateCalculatorAppProps): React.ReactElement {
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  useEffect(() => start(), [start]);
  return <div className="state-calculator-example"><RouterView router={router} /></div>;
}
