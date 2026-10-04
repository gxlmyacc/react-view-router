import { useEffect } from 'react';
import { BackHandler, Linking } from 'react-native';
import getPathnameFromDeepLink from './getPathnameFromDeepLink';

function navigateDeepLink(router, url, prefixes) {
  const pathname = getPathnameFromDeepLink(url, prefixes);
  if (pathname) router.push(pathname);
}

export default function useNativeNavigationBridge(router, prefixes) {
  useEffect(() => {
    let disposed = false;

    Linking.getInitialURL().then((url) => {
      if (!disposed && url) navigateDeepLink(router, url, prefixes);
    });

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // Let Android exit the app at the bottom of the memory stack.
      if (!router.history || router.history.index <= 0) return false;
      router.back();
      return true;
    });
    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      navigateDeepLink(router, url, prefixes);
    });

    return () => {
      disposed = true;
      backSubscription.remove();
      linkSubscription.remove();
    };
  }, [prefixes, router]);
}
