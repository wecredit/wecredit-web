/**
 * Credit card lender types for get-lenders?lenderType=creditcard
 * and credit-card apply / lead APIs.
 */

/** Raw lender object from get-lenders credit-card response */
export interface CreditCardLender {
  id: number;
  name: string;
  description: string;
  internalStatus: number;
  utmLink: string;
  approvalRate: number;
  uptoAmount: string;
  intRate: number;
  tenure: number;
  isPayday: number;
  imageUrl: string;
  isApi: number;
  affiliateStatus: number;
  watermark: string;
  logo: string;
  topColour: string;
  backColour: string;
  isAppEnabled: number;
  lenderType: 'creditcard' | string;
  utmEditableFields: unknown;
}

/** API response for get-lenders with lenderType=creditcard */
export interface CreditCardLendersResponse {
  success: boolean;
  message: string;
  statusCode: number;
  totalCount: number;
  lenders: CreditCardLender[];
}

/** Display model for a simple credit card offer card */
export interface CreditCardOffer {
  id: string;
  /** Raw lender name for creditCardName header / body */
  name: string;
  title: string;
  link: string;
  intro: string;
  imageUrl: string;
}

/** Result of checking existing credit-card lead / user details */
export interface CreditCardLeadStatusResult {
  hasExistingLead: boolean;
  data?: unknown;
  error?: string;
}

/** Payload for credit-card-lead submit */
export interface CreditCardLeadPayload {
  customerName: string;
  mobile: string;
  creditCardName: string;
  pan: string;
  monthlyIncome: number;
  pincode: number;
  gender: string;
  employmentType: string;
  dob: string;
  address: string;
  addressType: string;
}
