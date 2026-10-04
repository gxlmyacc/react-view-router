import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native';
import { RouterView } from 'react-view-router';
import RouteNavigation from './components/RouteNavigation';
import createAppRouter from './navigation/createAppRouter';
import DEEP_LINK_PREFIXES from './navigation/deepLinkConfig';
import useNativeNavigationBridge from './navigation/useNativeNavigationBridge';

export default function App() {
  // One router instance per mounted application; no module-global mutable singleton.
  const router = useMemo(() => createAppRouter(), []);
  useNativeNavigationBridge(router, DEEP_LINK_PREFIXES);

  return (
    <SafeAreaView>
      <RouteNavigation router={router} />
      <RouterView router={router} />
    </SafeAreaView>
  );
}
