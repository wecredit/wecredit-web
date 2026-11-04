/**
 * WeCredit Public API Client
 * Direct calls to WeCredit backend API
 * 
 * Implements:
 * - PDF Step 2: Fetch Active Lenders (Generic – Without Mobile Header)
 * - PDF Step 3: Fetch Active Lenders (User-Specific – With Mobile Header)
 * - PDF Step 6: Check Status All API
 */

import { wecreditConfig } from '@/lib/config';
import {
  ENDPOINTS,
  HEADER_LENDER_NAME,
  HEADER_MOBILE,
} from '@/lib/constants/api-keys';
import { withApiLogging } from '@/lib/utils/api-logger';
import { toast } from 'sonner';
import { buildUpswingForwardRequestUrl, notifyForwardNavigationEvent } from './upswing-navigation-event';
import type {
  ActiveLendersResponse,
  CheckStatusAllResponse,
  CheckStatusResult,
  LenderOfferStatus,
  LenderHandlingResult,
} from '@/types/wecredit';
import { getAttributionHeadersCommon, getAttributionHeaders } from './attribution-headers';
import { getEffectivePartnerCode } from '@/lib/utils/effective-partner-code';

/** Options for WeCredit API requests */
export interface WeCreditOptions {
  mobile?: string;
  authorization?: string;
  headers?: Record<string, string>;
  /**
   * When set, the request uses ISR caching (`next.revalidate`) instead of the
   * default `cache: 'no-store'`. Used for server-side (SSR) initial fetches.
   */
  revalidateSeconds?: number;
  /**
   * When true, omit URL-derived `lendername` so an explicit `lenderName` header is not duplicated.
   */
  omitLender?: boolean;
}

/** Result type for update utm clicked operation */
interface UpdateUtmClickedResult {
  success: boolean;
  error?: string;
}

/** Default empty response when API fails */
const DEFAULT_LENDERS_RESPONSE: ActiveLendersResponse = {};

/** Default check status response when API fails */
const DEFAULT_CHECK_STATUS_RESPONSE: CheckStatusAllResponse = {
  statusCode: '3012',
  lenders: [],
  isRehitLenders: 1,
};

/**
 * Builds headers for WeCredit API request
 * Includes environment-specific headers (X-Agent-Host in dev/staging)
 */
export function buildHeaders(options: WeCreditOptions): Record<string, string> {
  const { mobile, authorization, headers = {}, omitLender } = options;
  return {
    ...wecreditConfig.headers,
    ...(mobile && { [HEADER_MOBILE]: mobile }),
    ...(authorization && { Authorization: `Bearer ${authorization}` }),
    ...headers,
    ...getAttributionHeadersCommon(omitLender ? { omitLender: true } : undefined),
  };
}

/**
 * Leaves the SPA by replacing the current document with the lender HTML
 * (typically an auto-submit form).
 * Blob URLs are blocked in WhatsApp / RCS in-app WebViews, and replaceState('/')
 * can race Next.js back onto the homepage — write the HTML in place instead.
 */
function navigateWithHtmlRedirect(html: string): void {
  document.open();
  document.write(html);
  document.close();
}

type RedirectApiResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

function parseRedirectJsonResponse(json: {
  statusCode?: number | string;
  statusMessage?: string;
  utmLink?: string;
}): RedirectApiResult | null {
  const statusCodeNum =
    typeof json.statusCode === 'string'
      ? Number.parseInt(json.statusCode, 10)
      : json.statusCode;
  if (statusCodeNum === 200 && json.utmLink) {
    window.location.replace(json.utmLink);
    return { success: true };
  }
  if (statusCodeNum === 2006) {
    toast.error(json.statusMessage, {
      description: 'Unable to start journey.',
    });
    return {
      success: false,
      error: json.statusMessage,
    };
  }
  const isErrorStatus = statusCodeNum !== undefined && statusCodeNum !== 200;
  const isErrorMessage =
    Boolean(json.statusMessage) && json.statusMessage!.toLowerCase() !== 'success';
  if (isErrorStatus || isErrorMessage) {
    const message = json.statusMessage ?? 'Unable to process redirect. Please try again.';
    toast.error(message);
    return {
      success: false,
      error: message,
    };
  }
  return null;
}

function toRedirectCatchResult(error: unknown): RedirectApiResult {
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      success: false,
      error: 'Request timed out',
    };
  }
  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Unable to process redirect. Please try again.';
  return {
    success: false,
    error: errorMessage,
  };
}

interface ExecuteHtmlRedirectRequestParams {
  url: string;
  requestBody: Record<string, unknown>;
  headers: Record<string, string>;
  signal?: AbortSignal;
  onBeforeHtmlNavigate?: () => Promise<void>;
}

async function executeHtmlRedirectRequest(
  params: ExecuteHtmlRedirectRequestParams,
): Promise<RedirectApiResult> {
  const { url, requestBody, headers, signal, onBeforeHtmlNavigate } = params;
  try {
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    };
    if (signal instanceof AbortSignal) {
      fetchOptions.signal = signal;
    }
    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    
    try {
      const json = JSON.parse(text);
      const jsonResult = parseRedirectJsonResponse(json);
      if (jsonResult) {
        return jsonResult;
      }
    } catch {
      if (onBeforeHtmlNavigate) {
        await onBeforeHtmlNavigate();
      }
      navigateWithHtmlRedirect(text);
      return {
        success: true,
      };
    }
    return {
      success: false,
    };
  } catch (error) {
    return toRedirectCatchResult(error);
  }
}

/**
 * Builds headers for update utm clicked API
 */
function buildUtmClickedHeaders(
  mobile: string,
  lenderName: string,
  authorization?: string
): Record<string, string> {
  return {
    ...wecreditConfig.headers,
    [HEADER_MOBILE]: mobile,
    lendername: lenderName,
    ...(authorization && { Authorization: `Bearer ${authorization}` }),
    ...getAttributionHeadersCommon(),
  };
}

/**
 * PDF Step 2: Fetch Active Lenders (Generic – Without Mobile Header)
 * 
 * Fetches generic active lenders from WeCredit API
 * Used when user is NOT logged in
 * Returns empty object on error to prevent page crash
 */
export async function fetchActiveLenders(
  options: WeCreditOptions = {}
): Promise<ActiveLendersResponse> {
  const requestBody = {
    endpoint: ENDPOINTS.PUBLIC.ACTIVE_LENDERS,
    partnerCode: getEffectivePartnerCode(),
  };
  try {
    const data = await withApiLogging<ActiveLendersResponse>(
      'fetchActiveLenders',
      () => fetch(wecreditConfig.gatewayUrl, {
        method: 'POST',
        headers: buildHeaders(options),
        body: JSON.stringify(requestBody),
        // SSR callers opt into ISR; client calls keep the original no-store behavior.
        ...(options.revalidateSeconds != null
          ? { next: { revalidate: options.revalidateSeconds } }
          : { cache: 'no-store' }),
      }),
      {
        method: 'POST',
        url: wecreditConfig.gatewayUrl,
        headers: buildHeaders(options),
        body: requestBody,
        mobile: options.mobile,
        hasAuthorization: Boolean(options.authorization),
      }
    );
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unable to fetch lenders. Please try again later.';
    // toast.error(errorMessage);
    return DEFAULT_LENDERS_RESPONSE;
  }
}

/**
 * PDF Step 3: Fetch Active Lenders (User-Specific – With Mobile Header)
 * 
 * Fetches user-specific active lenders from WeCredit API
 * Requires mobile number in header for user identification
 * Used when user IS logged in
 */
export async function fetchActiveLendersForUser(
  mobile: string,
  authorization?: string
): Promise<ActiveLendersResponse> {
  if (!mobile) {
    return DEFAULT_LENDERS_RESPONSE;
  }
  const requestBody = {
    endpoint: ENDPOINTS.PUBLIC.ACTIVE_LENDERS,
    partnerCode: getEffectivePartnerCode(),
  };
  try {
    const data = await withApiLogging<ActiveLendersResponse>(
      'fetchActiveLendersForUser',
      () => fetch(wecreditConfig.gatewayUrl, {
        method: 'POST',
        headers: buildHeaders({ mobile, authorization }),
        body: JSON.stringify(requestBody),
        cache: 'no-store',
      }),
      {
        method: 'POST',
        url: wecreditConfig.gatewayUrl,
        headers: buildHeaders({ mobile, authorization }),
        body: requestBody,
        mobile,
        hasAuthorization: Boolean(authorization),
      }
    );
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load personalized lenders';
    // toast.error(errorMessage, {
    //   description: 'Unable to fetch your personalized offers. Please try again later.',
    // });
    return DEFAULT_LENDERS_RESPONSE;
  }
}

/**
 * PDF Step 6: Check Status All API
 * 
 * Checks the status of all loan applications/offers for the user
 * Used after login to determine if user has existing offers
 * 
 * Response Status Codes:
 * - 3003: Offers found successfully
 * - 3004: No offers, but can try more lenders
 * - 3005: API error occurred
 * - 3006: All lenders rejected
 * - 3012: General error
 * - 3018: Other specific error condition
 */

/** Lead API endpoint - uses /api/forward for lead operations */
const CHECK_STATUS_ALL_ENDPOINT = `${wecreditConfig.apiUrl}/api/forward`;
/** Lead API endpoint - uses /api/forward for offer click updates */
const UPDATE_UTM_CLICKED_ENDPOINT = `${wecreditConfig.apiUrl}/api/forward`;
export async function checkStatusAll(
  mobile: string,
  authorization?: string,
  signal?: AbortSignal
): Promise<CheckStatusResult> {
  if (!mobile) {
    return {
      success: false,
      error: 'Mobile number required',
    };
  }
  const requestBody = {
    mobile: Number(mobile),
    endpoint: ENDPOINTS.PUBLIC.CHECK_STATUS_ALL,
    partnerCode: getEffectivePartnerCode(),
  };
  try {
    // Build fetch options - only include signal if it's a valid AbortSignal
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: buildHeaders({ mobile, authorization }),
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    };
    
    // Only add signal if it's defined and is a valid AbortSignal
    if (signal instanceof AbortSignal) {
      fetchOptions.signal = signal;
    }
    
    const data = await withApiLogging<CheckStatusAllResponse>(
      'checkStatusAll',
      () => fetch(CHECK_STATUS_ALL_ENDPOINT, fetchOptions),
      {
        method: 'POST',
        url: CHECK_STATUS_ALL_ENDPOINT,
        headers: buildHeaders({ mobile, authorization }),
        body: requestBody,
        mobile,
        hasAuthorization: Boolean(authorization),
      }
    );
    return {
      success: true,
      data,
    };
  } catch (error) {
    // Handle manual cancellation or timeout from AbortController
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[checkStatusAll] Request timed out or was aborted');
      return {
        success: false,
        error: 'Request timed out',
        data: DEFAULT_CHECK_STATUS_RESPONSE,
      };
    }
    const errorMessage = error instanceof Error? error.message: 'Unable to check status. Please try again.';
    //toast.error(errorMessage, {description: 'Failed to check your loan application status.', });
    return {
      success: false,
      error: errorMessage,
      data: DEFAULT_CHECK_STATUS_RESPONSE,
    };
  }
}

/**
 * Updates UTM clicked status for a lender offer
 * @param mobile - User's mobile number
 * @param lenderName - Lender identifier for tracking
 */
export async function updateUtmClicked(
  mobile: string,
  lenderName: string,
  authorization?: string
): Promise<UpdateUtmClickedResult> {
  if (!mobile || !lenderName) {
    return {
      success: false,
      error: 'Mobile number and lender name required',
    };
  }
  const requestBody: { endpoint: string; partnerCode: string } = {
    endpoint: ENDPOINTS.PUBLIC.UPDATE_UTM_CLICKED,
    // partnerCode: lenderName,   // Check by Ketan and Shyamal
    partnerCode: getEffectivePartnerCode(),
  };
  const headers: Record<string, string> = buildUtmClickedHeaders(mobile, lenderName, authorization);
  try {
    await withApiLogging<unknown>(
      'updateUtmClicked',
      () => fetch(UPDATE_UTM_CLICKED_ENDPOINT, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody),
        cache: 'no-store',
      }),
      {
        method: 'PUT',
        url: UPDATE_UTM_CLICKED_ENDPOINT,
        headers,
        body: requestBody,
        mobile,
        hasAuthorization: false,
      }
    );
    return {
      success: true,
    };
  } catch (error) {
    const errorMessage: string = error instanceof Error
      ? error.message
      : 'Unable to update offer click.';
    toast.error(errorMessage, {
      description: 'Failed to track offer click.',
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
}
export async function forwardUpswingRedirect(
  mobile: string,
  authorization?: string,
  utmLink?: string,
  signal?: AbortSignal,
): Promise<RedirectApiResult> {
  if (!mobile) {
    return {
      success: false,
      error: 'Mobile number required',
    };
  }
  return executeHtmlRedirectRequest({
    url: buildUpswingForwardRequestUrl(mobile),
    requestBody: {
      endpoint: 'upswing-redirect',
      partnerCode: getEffectivePartnerCode(),
    },
    headers: buildHeaders({ mobile, authorization }),
    signal,
    // Await analytics so Blob navigation does not abort the event request.
    onBeforeHtmlNavigate: utmLink
      ? () => notifyForwardNavigationEvent(mobile, utmLink)
      : undefined,
  });
}

/**
 * Lender redirect via `/api/public` (`lender-redirection`).
 * HTML responses navigate via Blob URL; JSON responses with `utmLink` navigate directly.
 */
export async function forwardLenderRedirectByPhone(
  mobile: string,
  lenderName: string,
  authorization?: string,
  signal?: AbortSignal,
): Promise<RedirectApiResult> {
  if (!mobile) {
    return {
      success: false,
      error: 'Mobile number required',
    };
  }
  const resolvedLenderName = lenderName.trim();
  if (!resolvedLenderName) {
    return {
      success: false,
      error: 'Lender name is required to continue.',
    };
  }
  return executeHtmlRedirectRequest({
    url: wecreditConfig.gatewayUrl,
    requestBody: {
      endpoint: ENDPOINTS.PUBLIC.LENDER_REDIRECTION,
      partnerCode: getEffectivePartnerCode(),
    },
    headers: buildHeaders({
      mobile,
      authorization,
      omitLender: true,
      headers: { [HEADER_LENDER_NAME]: resolvedLenderName },
    }),
    signal,
  });
}
/**
 * PDF Step 7: Clicked Lender Handling
 * 
 * Determines how to handle a clicked lender based on wcStatus
 * 
 * @param offers - List of user's existing offers from checkStatusAll
 * @param lenderName - Name of the lender user clicked
 * @returns Handling result with appropriate action type
 * 
 * Cases:
 * - Lender Found & wcStatus = INITIATED → Continue with existing application
 * - Lender Found & wcStatus != INITIATED → Show existing status/offer
 * - Lender Not Found → Start new application
 */
export function determineLenderHandling(
  offers: LenderOfferStatus[],
  lenderName: string
): LenderHandlingResult {
  // Case: No offers exist at all
  if (!offers || offers.length === 0) {
    return { type: 'no_offers' };
  }
  // Find the clicked lender in the offers list
  const matchingOffer = offers.find(
    (offer) => offer.lenderName === lenderName
  );
  // Case: Lender not found in offer list → New application
  if (!matchingOffer) {
    return { type: 'not_found', lenderName };
  }
  // Case: Lender found with INITIATED status
  if (matchingOffer.wcStatus === 'INITIATED') {
    return { type: 'initiated', offer: matchingOffer };
  }
  // Case: Lender found with other status (existing application)
  return { type: 'existing', offer: matchingOffer };
}

/**
 * Re-hit All Lenders API
 * 
 * Triggers a re-check across all available lenders to find more offers
 * Used when user wants to check for additional lenders beyond initial offers
 * 
 * @param mobile - User's mobile number
 * @param authorization - Optional auth token
 * @returns Result with updated offers list
 */

/** Lead API endpoint - uses /api/forward for lead operations */
const HIT_ALL_LENDERS_ENDPOINT = `${wecreditConfig.apiUrl}/api/forward`;


export async function hitAllLenders(
  mobile: string,
  authorization?: string
): Promise<CheckStatusResult> {
  if (!mobile) {
    return {
      success: false,
      error: 'Mobile number required',
    };
  }
  const requestBody = {
    mobile: Number(mobile),
    endpoint: ENDPOINTS.PUBLIC.HIT_ALL_LENDERS,
    partnerCode: getEffectivePartnerCode(),
  };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000); // 15s timeout
    const data = await withApiLogging<CheckStatusAllResponse>(
      'hitAllLenders',
      () => fetch(HIT_ALL_LENDERS_ENDPOINT, {
        method: 'POST',
        headers: buildHeaders({ mobile, authorization }),
        body: JSON.stringify(requestBody),
        cache: 'no-store',
        signal: controller.signal,
      }),
      {
        method: 'POST',
        url: HIT_ALL_LENDERS_ENDPOINT,
        headers: buildHeaders({ mobile, authorization }),
        body: requestBody,
        mobile,
        hasAuthorization: Boolean(authorization),
      }
    );

    clearTimeout(timeoutId);

    // Return the full response so callers can inspect fields like
    // `isWecreditWebsiteData` to decide whether to open the lead form.
    return {
      success: true,
      data,
    };
  } catch (error) {
  // Handle timeout explicitly
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      success: false,
      error: 'Request timed out',
      data: DEFAULT_CHECK_STATUS_RESPONSE,
    };
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Unable to check for new offers. Please try again.';

  return {
    success: false,
    error: errorMessage,
    data: DEFAULT_CHECK_STATUS_RESPONSE,
  };
}
}
