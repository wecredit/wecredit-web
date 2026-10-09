/** Google Sheet used for blog and loan URL mappings (WeCredit - All Urls). */
export const GOOGLE_SHEET_ROUTES = {
  SHEET_ID: '1-EPYlYvCImOcqBSamBG1f5ak_-xaSM-Ddk8wv6QHkiU',
  /** "Blog Pages" tab */
  BLOG_GID: '427369533',
  /** "Pages" tab (default gid 0) */
  PAGES_GID: '0',
  /** "Loan Pages" tab */
  LOANS_GID: '1943380180',
  /** "Loan Apps" tab */
  LOAN_APPS_GID: '253858183',
  CACHE_TTL_MS: 5 * 60 * 1000,
  PROXY_REQUEST_TIMEOUT_MS: 5 * 1000,
} as const;
