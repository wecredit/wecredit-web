import { NATIVE_APP } from '@/lib/constants/native-app';

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1);
  }
  return withLeadingSlash;
}

/**
 * Blog content must stay in the browser (matches assetlinks blog excludes).
 */
export function isBlogPathname(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return normalized === '/blog' || normalized.startsWith('/blog/');
}

/**
 * True for Android mobile browsers (excludes tablets labeled as Android when needed later).
 */
export function isAndroidUserAgent(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

/**
 * True when the page is loaded inside the native app WebView (`?platform=mobile`).
 */
export function isInAppWebViewSearch(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return params.get('platform')?.trim().toLowerCase() === 'mobile';
}

export type BuildAndroidAppIntentUrlInput = {
  readonly pathname: string;
  readonly search: string;
  readonly fallbackHttpsUrl: string;
};

/**
 * Builds an Android Intent URL that opens the installed WeCredit app via HTTPS App Links,
 * falling back to the current website URL when the app is not installed.
 */
export function buildAndroidAppIntentUrl(input: BuildAndroidAppIntentUrlInput): string {
  const rawPath = input.pathname || '/';
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const query = input.search.startsWith('?')
    ? input.search
    : input.search
      ? `?${input.search}`
      : '';
  const hostAndPath = `${NATIVE_APP.APP_LINK_HOST}${path}${query}`;
  const fallback = encodeURIComponent(input.fallbackHttpsUrl);
  return (
    `intent://${hostAndPath}#Intent;` +
    `scheme=https;` +
    `package=${NATIVE_APP.ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${fallback};` +
    `end`
  );
}

export type ShouldAttemptAndroidOpenAppInput = {
  readonly userAgent: string;
  readonly pathname: string;
  readonly search: string;
  readonly hasAttemptedThisSession: boolean;
};

/**
 * Decides whether the website should attempt to hand off to the Android app.
 */
export function shouldAttemptAndroidOpenApp(
  input: ShouldAttemptAndroidOpenAppInput
): boolean {
  if (input.hasAttemptedThisSession) {
    return false;
  }
  if (!isAndroidUserAgent(input.userAgent)) {
    return false;
  }
  if (isInAppWebViewSearch(input.search)) {
    return false;
  }
  if (isBlogPathname(input.pathname)) {
    return false;
  }
  return true;
}

/**
 * Navigates to the Android Intent URL so the OS can open the native app when installed.
 */
export function openAndroidAppFromBrowser(intentUrl: string): void {
  window.location.assign(intentUrl);
}
