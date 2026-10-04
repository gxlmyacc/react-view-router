import React, { useContext } from 'react';
import { useRouter, useViewActivate, useViewDeactivate } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import { DrawerLogContext } from './context';
import HomePage from './HomePage';

// Forward the class instance so RouterDrawer can call the parent page's lifecycle methods.
const HomePageRoute = React.forwardRef<HomePage>((_props, ref) => {
  const router = useRouter()!;
  const { t } = useDemoRuntime();
  const record = useContext(DrawerLogContext);
  useViewDeactivate(() => record('hookDeactivate'));
  useViewActivate(() => record('hookActivate'));
  return <HomePage ref={ref} router={router} t={t} record={record} />;
});

export default HomePageRoute;
