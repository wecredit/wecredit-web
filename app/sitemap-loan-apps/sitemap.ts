import type { MetadataRoute } from 'next';

import { fetchLoanAppRoutesFromSheet } from '@/lib/sitemap/fetch-loan-app-routes-from-sheet';
import {
  buildPathSitemapEntries,
  dedupeSitemapEntries,
  getSiteBaseUrl,
} from '@/lib/sitemap/sitemap-utils';
import { shouldAllowSitemap } from '@/lib/utils/seo-utils';

/** Revalidate loan apps sitemap every five minutes (matches the sheet cache). */
export const revalidate = 300;

/**
 * Loan app pages sitemap at /sitemap-loan-apps/sitemap.xml.
 * Contains all source paths from the "Loan Apps" tab in Google Sheet.
 */
export default async function sitemapLoanApps(): Promise<MetadataRoute.Sitemap> {
  if (!shouldAllowSitemap()) return [];

  const baseUrl = getSiteBaseUrl();
  if (!baseUrl) return [];

  const loanAppRoutes = await fetchLoanAppRoutesFromSheet();
  const loanAppPaths = loanAppRoutes
    .filter((route) => route.showInSitemap === true)
    .map((route) => ({
      path: route.source,
      lastModified: route.modifiedDate,
    }));

  return dedupeSitemapEntries(buildPathSitemapEntries(baseUrl, loanAppPaths));
}
