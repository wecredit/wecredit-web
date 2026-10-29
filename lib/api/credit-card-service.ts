/**
 * Credit card APIs:
 * - get-lenders?lenderType=creditcard (public list)
 * - get-creditcard-leads (check existing user details; requires auth)
 * - credit-card-lead (submit application form; requires auth)
 */

import { getCookie } from 'cookies-next';
import { toast } from 'sonner';
import { wecreditConfig } from '@/lib/config';
import {
  ENDPOINTS,
  HEADER_CREDIT_CARD_NAME,
  STORAGE_AUTH_TOKEN,
  STORAGE_MOBILE,
} from '@/lib/constants/api-keys';
import { withApiLogging } from '@/lib/utils/api-logger';
import { getEffectivePartnerCode } from '@/lib/utils/effective-partner-code';
import { getErrorMessage, isAbortError } from '@/lib/utils/error-helpers';
import {
  getLoanFormStatus,
  getResponseMessage,
  getResponseStatus,
} from '@/lib/utils/response-helpers';
import { buildHeaders, type WeCreditOptions } from '@/lib/api/wecredit';
import type {
  CreditCardLeadPayload,
  CreditCardLeadStatusResult,
  CreditCardLendersResponse,
} from '@/types/credit-card';

const LENDER_TYPE_CREDIT_CARD = 'creditcard';
const CREDIT_CARD_FORWARD_ENDPOINT = `${wecreditConfig.apiUrl}/api/forward`;

const DEFAULT_CREDIT_CARD_LENDERS_RESPONSE: CreditCardLendersResponse = {
  success: false,
  message: '',
  statusCode: 0,
  totalCount: 0,
  lenders: [],
};

/**
 * Builds the public gateway URL for credit-card lenders.
 */
function buildCreditCardLendersUrl(): string {
  return `${wecreditConfig.gatewayUrl}?lenderType=${LENDER_TYPE_CREDIT_CARD}`;
}

function buildCreditCardAuthHeaders(
  mobile: string,
  extraHeaders: Record<string, string> = {}
): Record<string, string> {
  const token = getCookie(STORAGE_AUTH_TOKEN);
  return buildHeaders({
    mobile,
    authorization: typeof token === 'string' ? token : undefined,
    headers: extraHeaders,
  });
}

function hasSuccessfulLeadStatus(loanFormStatus: unknown): boolean {
  const normalizedStatus =
    typeof loanFormStatus === 'string'
      ? loanFormStatus.trim().toLowerCase()
      : loanFormStatus;
  return (
    normalizedStatus === true ||
    normalizedStatus === 1 ||
    normalizedStatus === 'success' ||
    normalizedStatus === 'submitted' ||
    normalizedStatus === 'approved' ||
    normalizedStatus === 'completed'
  );
}

/**
 * Resolves the lead payload from get-creditcard-leads.
 * API nests customer fields under `data` when a lead already exists.
 */
function getCreditCardLeadPayload(responseData: unknown): Record<string, unknown> | null {
  if (typeof responseData !== 'object' || responseData === null) {
    return null;
  }
  const record = responseData as Record<string, unknown>;
  if (typeof record.data === 'object' && record.data !== null) {
    return record.data as Record<string, unknown>;
  }
  return record;
}

function responseHasCustomerDetails(responseData: unknown): boolean {
  const payload = getCreditCardLeadPayload(responseData);
  if (!payload) {
    return false;
  }
  const customerName = payload.customerName ?? payload.name ?? payload.fullName;
  const pan = payload.pan;
  if (typeof customerName === 'string' && customerName.trim().length > 0) {
    return true;
  }
  if (typeof pan === 'string' && pan.trim().length > 0) {
    return true;
  }
  return false;
}

/**
 * Fetches active credit-card lenders from get-lenders.
 * Does not require auth; optional mobile/authorization may still be passed.
 */
export async function fetchCreditCardLenders(
  options: WeCreditOptions = {}
): Promise<CreditCardLendersResponse> {
  const url = buildCreditCardLendersUrl();
  const requestBody = {
    endpoint: ENDPOINTS.PUBLIC.GET_LENDERS,
    partnerCode: getEffectivePartnerCode(),
  };
  try {
    const data = await withApiLogging<CreditCardLendersResponse>(
      'fetchCreditCardLenders',
      () =>
        fetch(url, {
          method: 'POST',
          headers: buildHeaders(options),
          body: JSON.stringify(requestBody),
          cache: 'no-store',
        }),
      {
        method: 'POST',
        url,
        headers: buildHeaders(options),
        body: requestBody,
        mobile: options.mobile,
        hasAuthorization: Boolean(options.authorization),
      }
    );
    if (!data || !Array.isArray(data.lenders)) {
      return DEFAULT_CREDIT_CARD_LENDERS_RESPONSE;
    }
    return data;
  } catch {
    return DEFAULT_CREDIT_CARD_LENDERS_RESPONSE;
  }
}

/**
 * Checks whether the user already has credit-card lead / profile details.
 * Uses get-creditcard-leads with creditCardName header.
 */
export async function fetchCreditCardLeadStatus(
  creditCardName: string,
  signal?: AbortSignal
): Promise<CreditCardLeadStatusResult> {
  const name = creditCardName.trim();
  if (!name) {
    return { hasExistingLead: false, error: 'Credit card name is required' };
  }
  const mobileCookie = getCookie(STORAGE_MOBILE);
  const mobile =
    typeof mobileCookie === 'string' ? mobileCookie.replace(/\D/g, '') : '';
  if (!/^[0-9]{10}$/.test(mobile)) {
    return { hasExistingLead: false, error: 'Invalid mobile number' };
  }
  const requestBody = {
    endpoint: ENDPOINTS.FORWARD.GET_CREDITCARD_LEADS,
    partnerCode: getEffectivePartnerCode(),
  };
  try {
    const response = await fetch(CREDIT_CARD_FORWARD_ENDPOINT, {
      method: 'POST',
      headers: buildCreditCardAuthHeaders(mobile, {
        [HEADER_CREDIT_CARD_NAME]: name,
      }),
      body: JSON.stringify(requestBody),
      signal,
      cache: 'no-store',
    });
    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch {
      responseData = undefined;
    }
    const responseMessage = getResponseMessage(responseData);
    const responseStatus = getResponseStatus(responseData);
    const loanFormStatus = getLoanFormStatus(responseData);
    if (loanFormStatus !== undefined) {
      return {
        hasExistingLead: hasSuccessfulLeadStatus(loanFormStatus),
        data: responseData,
      };
    }
    if (
      response.status === 404 ||
      responseStatus === 404 ||
      responseMessage?.toLowerCase().includes('lead not found') ||
      responseMessage?.toLowerCase().includes('not found') ||
      responseMessage?.toLowerCase().includes('no data')
    ) {
      return { hasExistingLead: false, data: responseData };
    }
    if (response.ok) {
      const hasDetails = responseHasCustomerDetails(responseData);
      return { hasExistingLead: hasDetails, data: responseData };
    }
    const errorMessage =
      responseMessage || `Request failed with status ${response.status}`;
    return { hasExistingLead: false, error: errorMessage, data: responseData };
  } catch (error) {
    if (isAbortError(error)) {
      return { hasExistingLead: false };
    }
    return {
      hasExistingLead: false,
      error: getErrorMessage(error, 'Failed to check credit card details'),
    };
  }
}

/**
 * Submits the credit card application form via credit-card-lead.
 */
export async function submitCreditCardLead(
  payload: CreditCardLeadPayload
): Promise<boolean> {
  const phoneDigits = payload.mobile.replace(/\D/g, '');
  if (!/^[0-9]{10}$/.test(phoneDigits)) {
    toast.error('Invalid phone number', {
      description: 'Please enter a valid 10-digit phone number.',
    });
    return false;
  }
  const requestBody = {
    endpoint: ENDPOINTS.FORWARD.CREDIT_CARD_LEAD,
    partnerCode: getEffectivePartnerCode(),
    customerName: payload.customerName,
    mobile: phoneDigits,
    creditCardName: payload.creditCardName,
    pan: payload.pan,
    monthlyIncome: payload.monthlyIncome,
    pincode: payload.pincode,
    gender: payload.gender,
    employmentType: payload.employmentType,
    dob: payload.dob,
    address: payload.address,
    addressType: payload.addressType,
  };
  try {
    const response = await fetch(CREDIT_CARD_FORWARD_ENDPOINT, {
      method: 'POST',
      headers: buildCreditCardAuthHeaders(phoneDigits),
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });
    if (response.ok) {
      toast.success('Credit card application submitted successfully');
      return true;
    }
    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch {
      responseData = undefined;
    }
    const errorMessage =
      getResponseMessage(responseData) ||
      `Request failed with status ${response.status}`;
    toast.error(errorMessage, {
      description: 'Unable to submit your credit card application.',
    });
    return false;
  } catch (error) {
    toast.error(getErrorMessage(error, 'Network error occurred'), {
      description: 'Failed to submit your credit card application.',
    });
    return false;
  }
}
