/**
 * SEO Utility Functions
 *
 * Environment-based detection prevents non-production (staging) deployments from
 * being indexed, so staging URLs never compete with the production site in search.
 * Controlled by NEXT_PUBLIC_ENVIRONMENT.
 */


export function shouldPreventIndexing(): boolean {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase();
  if (environment === "staging") {
    return true;
  }

  // Default: Allow indexing (production)
  return false;
}

/**
 * Whether sitemap.xml routes should return URLs.
 * Staging/deployed non-prod still returns empty sitemaps for SEO safety,
 * but local `next dev` always generates sitemaps for testing.
 */
export function shouldAllowSitemap(): boolean {
  // Temporary: allow sitemap generation on staging so QA/SEO can validate
  // `/sitemap.xml`, `/sitemap-page.xml`, `/sitemap-posts.xml`, `/sitemap-loans.xml`, and `/sitemap-loan-apps.xml` on staging.
  // NOTE: robots behavior is unchanged and still controls crawl/index policy.
  if (process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() === "staging") {
    return true;
  }

  if (!shouldPreventIndexing()) {
    return true;
  }

  return process.env.NODE_ENV === "development";
}