import { GOOGLE_SHEET_ROUTES } from '@/lib/constants/google-sheet-routes';
import {
  fetchRoutesFromSheet,
  normalizeSheetSourcePath,
  type SheetRouteMapping,
  type SheetRoutesRequestOptions,
} from '@/lib/sitemap/fetch-sheet-routes';

export type LoanAppRouteMapping = SheetRouteMapping;

export const normalizeLoanAppSourcePath = normalizeSheetSourcePath;

/** Loads loan apps sitemap rows from the Google Sheet tab. */
export async function fetchLoanAppRoutesFromSheet(
  options: SheetRoutesRequestOptions = {}
): Promise<LoanAppRouteMapping[]> {
  return fetchRoutesFromSheet({
    gid: GOOGLE_SHEET_ROUTES.LOAN_APPS_GID,
    logLabel: 'fetchLoanAppRoutesFromSheet',
    requestTimeoutMs: options.requestTimeoutMs,
  });
}
