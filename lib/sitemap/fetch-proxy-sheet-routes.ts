import { GOOGLE_SHEET_ROUTES } from '@/lib/constants/google-sheet-routes';
import { fetchBlogRoutesFromSheet } from '@/lib/sitemap/fetch-blog-routes-from-sheet';
import { fetchLoanAppRoutesFromSheet } from '@/lib/sitemap/fetch-loan-app-routes-from-sheet';
import { fetchLoanRoutesFromSheet } from '@/lib/sitemap/fetch-loan-routes-from-sheet';
import { fetchPagesRoutesFromSheet } from '@/lib/sitemap/fetch-pages-routes-from-sheet';
import type { SheetRouteMapping } from '@/lib/sitemap/fetch-sheet-routes';
import { normalizeSheetSourcePath } from '@/lib/sitemap/fetch-sheet-routes';

const BLOG_DESTINATION_ORIGIN = 'https://blog.wecredit.co.in';

function isBlogDestination(destination: string): boolean {
  try {
    return new URL(destination).origin === BLOG_DESTINATION_ORIGIN;
  } catch {
    return false;
  }
}

/** Merges Blog + Loan + Loan App rows, plus Pages rows that point to the blog origin. */
export async function fetchProxySheetRoutes(): Promise<SheetRouteMapping[]> {
  const requestOptions = {
    requestTimeoutMs: GOOGLE_SHEET_ROUTES.PROXY_REQUEST_TIMEOUT_MS,
  };
  const [pagesRoutes, blogRoutes, loanRoutes, loanAppRoutes] = await Promise.all([
    fetchPagesRoutesFromSheet(requestOptions),
    fetchBlogRoutesFromSheet(requestOptions),
    fetchLoanRoutesFromSheet(requestOptions),
    fetchLoanAppRoutesFromSheet(requestOptions),
  ]);
  const routesBySource = new Map<string, SheetRouteMapping>();
  for (const route of pagesRoutes) {
    const source = normalizeSheetSourcePath(route.source);
    if (source && isBlogDestination(route.destination)) {
      routesBySource.set(source, route);
    }
  }
  for (const route of blogRoutes) {
    const source = normalizeSheetSourcePath(route.source);
    if (source && route.destination) {
      routesBySource.set(source, route);
    }
  }
  for (const route of loanRoutes) {
    const source = normalizeSheetSourcePath(route.source);
    if (source && route.destination) {
      routesBySource.set(source, route);
    }
  }
  for (const route of loanAppRoutes) {
    const source = normalizeSheetSourcePath(route.source);
    if (source && route.destination) {
      routesBySource.set(source, route);
    }
  }
  return Array.from(routesBySource.values());
}
