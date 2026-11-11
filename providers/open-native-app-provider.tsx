'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { NATIVE_APP } from '@/lib/constants/native-app';
import {
  buildAndroidAppIntentUrl,
  openAndroidAppFromBrowser,
  shouldAttemptAndroidOpenApp,
} from '@/lib/utils/open-native-app';

interface OpenNativeAppProviderProps {
  children?: React.ReactNode;
}

/**
 * On Android mobile browsers, attempts once per session to open the native WeCredit app
 * for non-blog pages. Blog routes and in-app WebViews (`?platform=mobile`) stay in the browser.
 */
export function OpenNativeAppProvider({
  children,
}: OpenNativeAppProviderProps): React.ReactNode {
  const pathname = usePathname();
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (hasRunRef.current) {
      return;
    }
    const search = window.location.search;
    const hasAttemptedThisSession =
      sessionStorage.getItem(NATIVE_APP.SESSION_ATTEMPTED_KEY) === '1';
    const canAttempt = shouldAttemptAndroidOpenApp({
      userAgent: window.navigator.userAgent,
      pathname: pathname || window.location.pathname,
      search,
      hasAttemptedThisSession,
    });
    if (!canAttempt) {
      return;
    }
    hasRunRef.current = true;
    sessionStorage.setItem(NATIVE_APP.SESSION_ATTEMPTED_KEY, '1');
    const intentUrl = buildAndroidAppIntentUrl({
      pathname: window.location.pathname,
      search: window.location.search,
      fallbackHttpsUrl: window.location.href,
    });
    openAndroidAppFromBrowser(intentUrl);
  }, [pathname]);
  return <>{children}</>;
}
