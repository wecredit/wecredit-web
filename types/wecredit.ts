/**
 * WeCredit Public API Type Definitions
 * Types for the WeCredit lender/offers API
 */

/** Product type from API; used for dynamic labels (e.g. amount line on offer cards). */
export type LenderType = 'business_loan' | 'personal_loan' | 'creditcard';

/** Raw lender data from the API response */
export interface Lender {
  id: number;
  Name: string;
  logo: string | null;
  ImageUrl: string | null;
  IntRate: number | null;
  Tenure: number | null;
  /** 1 when tenure is expressed in days; 0 when expressed in months. */
  isPayday?: number | null;
  UptoAmount: string | null;
  utmLink: string | null;
  Description: string | null;
  ApprovalRate: number | null;
  AvgTicketSize: number | null;
  MinAge: number | null;
  MaxAge: number | null;
  MinIncome: number | null;
  EmploymentType: string | null;
  PincodeValidation: number | null;
  IsApi: number;
  IsAppEnabled: number;
  affiliateStatus: number;
  internalStatus: number;
  backColour: string | null;
  topColour: string | null;
  watermark: string | null;
  /** When null or omitted, generic copy is used (e.g. "Amount upto"). */
  lenderType?: LenderType | null;
}

/** API response structure for active-lenders endpoint */
export interface ActiveLendersResponse {
  [key: string]: Lender;
}

export interface Partner {
  name: string;
  logo: string;
}

// ============================================
// Check Status API Types (PDF Step 6 & 7)
// ============================================

/**
 * WeCredit Status values for loan applications
 * Per PDF Step 7 - Clicked Lender Handling
 */
export type WcStatus =
  | 'NOT_PROCESSED'           // Offer not yet processed
  | 'INITIATED'               // Loan application just started
  | 'ELIGIBILITY_REJECTED'    // Lender rejected due to eligibility criteria
  | 'UTM_CLICKED'             // Lender link clicked
  | 'JOURNEY_STARTED'         // User started the journey on lender site
  | 'UNDER_REVIEW'            // Application under review
  | 'PENDING'                 // Waiting for processing
  | 'APPROVED'                 // Loan approved
  | 'REJECTED'                // Loan rejected
  | 'DISBURSED'               // Loan disbursed
  | 'COMPLETED'               // Loan completed
  | 'CANCELLED';              // Loan cancelled

/**
 * Individual lender offer status in check-status-all response
 * Matches actual API response structure from documentation
 */
export interface LenderOfferStatus {
  /** Lender name/identifier */
  lenderName: string;
  /** Lender name/identifier */
  uptoAmount?: string;
  /** WeCredit application status */
  wcStatus: WcStatus;
  /**
   * When false, lender-led outcomes (e.g. REJECTED / NOT_PROCESSED) surface in Unmatched UI.
   * When true or omitted, legacy behaviour: INITIATED in explore; DISBURSED hidden; other statuses in recently-clicked / status flows.
   */
  lenderStatus?: boolean;
  /** Direct application link (for INITIATED status) */
  utmLink?: string;
  /** Offered/requested loan amount */
  loanAmount?: string;
  /** Interest rate percentage */
  intRate?: string;
  /** Loan tenure in months */
  tenure?: string;
  /** Monthly EMI amount */
  emi?: string;
  /** Lender logo URL */
  logo?: string;
  /** UI gradient colors [startColor, endColor] */
  gradient?: [string, string];
  /** Display title for the offer */
  title?: string;
  /** Display subtitle for the offer */
  subtitle?: string;
  /** Human-readable status message */
  statusMessage?: string;
  /** Mirrors active-lenders `lenderType` when present in check-status payloads. */
  lenderType?: LenderType | null;
  /** Approval chance percentage (0-100) */
  approvalRate?: number;
  /** Webhook sent flag: 2 = sent via webhook */
  isWebHookSent?: number;
}

/**
 * Check Status All API Response
 * Per PDF Step 6 - Check Status Result – Decision Logic
 * Matches actual API response structure from documentation
 */
export interface CheckStatusAllResponse {
  /** Domain-specific status code from API */
  statusCode: string;
  /** List of lender/offer objects */
  lenders: LenderOfferStatus[];
  /** Re-hit flag: 0 = more lenders available, 1 = all checked */
  isRehitLenders: number;
  /** Declared monthly salary from lead details when available. */
  declaredSalary?: number | string | null;
  /** Employment type from lead details when available. */
  empType?: string | null;
  /** Required loan amount from lead details when available. */
  requiredLoanAmount?: number | string | null;
  /** True when the existing record originates from the WeCredit website.
   *  Explicit `false` means the user must go through the multi-lender lead form. */
  isWecreditWebsiteData?: boolean;
}

/**
 * Status code constants from API documentation
 */
export const STATUS_CODES = {
  /** Offers found successfully */
  OFFERS_FOUND: '3003',
  /** No offers, but can try more lenders */
  NO_OFFERS_CAN_REHIT: '3004',
  /** API error occurred */
  API_ERROR: '3005',
  /** All lenders rejected */
  ALL_REJECTED: '3006',
  /** General error */
  GENERAL_ERROR: '3012',
  /** Other specific error condition */
  OTHER_ERROR: '3018',
} as const;

/**
 * Result type for check status operation
 */
export interface CheckStatusResult {
  /** Whether the check was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Response data */
  data?: CheckStatusAllResponse;
}

/**
 * Lender handling result based on wcStatus
 * Per PDF Step 7 - Clicked Lender Handling
 */
export type LenderHandlingResult =
  | { type: 'initiated'; offer: LenderOfferStatus }    // wcStatus = INITIATED
  | { type: 'existing'; offer: LenderOfferStatus }     // wcStatus != INITIATED
  | { type: 'not_found'; lenderName: string }          // Lender not in offer list
  | { type: 'no_offers' };                             // No offers exist

/** Federal Bank redirect forward API success payload */
export interface FederationBankRedirectResponse {
  statusCode?: number | string;
  statusMessage?: string;
  leadId?: string;
  utmLink?: string;
}

/** Zapcash SSO redirect forward API payload */
export interface ZapcashSsoRedirectResponse {
  statusCode?: number | string;
  statusMessage?: string;
  utmLink?: string;
}