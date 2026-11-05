/**
 * Primepl lead form: state shape, validation, and API payload builder.
 * Submit body aligns with forward API `prime-pl-leads` contract (consent is not part of it).
 */

import { sanitizeNumericInput } from '@/lib/utils/form-helpers';
import { isValidMobile } from '@/lib/utils/common-helper';
import {
  getAddressFieldValidationError,
  getPlainTextFieldValidationError,
} from '@/lib/utils/validators';

export { sanitizeNumericInput };

/** Occupation values accepted by the Primepl lead API (extend if backend adds more). */
export const PRIMEPL_OCCUPATION_OPTIONS = [
  'Salaried',
  'Self-employed',
  'Other',
] as const;

export type PrimeplOccupation = (typeof PRIMEPL_OCCUPATION_OPTIONS)[number];

export interface PrimeplLeadFormState {
  name: string;
  mobile: string;
  /** User-entered address; maps to API `locationText`. */
  address: string;
  areaPincode: string;
  /** Rupees — stored as digits string, sent as number. */
  loanAmount: string;
  occupation: PrimeplOccupation;
  /** Rupees per month — stored as digits string, sent as number. */
  netSalaryPm: string;
  /**
   * FE-only: checkbox for terms/privacy; validated before submit but never sent to the API.
   */
  consent: boolean;
}

export const DEFAULT_PRIMEPL_LEAD_FORM_STATE: PrimeplLeadFormState = {
  name: '',
  mobile: '',
  address: '',
  areaPincode: '',
  loanAmount: '',
  occupation: 'Salaried',
  netSalaryPm: '',
  consent: true,
};

/** Default `sourceChannel` for the forward API (matches sample integration). */
export const PRIMEPL_DEFAULT_SOURCE_CHANNEL = 'web';

function parsePositiveInt(raw: string, fieldLabel: string): { value: number; error?: string } {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return { value: 0, error: `${fieldLabel} is required` };
  }
  const n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) {
    return { value: 0, error: `Enter a valid ${fieldLabel.toLowerCase()}` };
  }
  return { value: n };
}

export const validatePrimeplLeadForm = (
  values: PrimeplLeadFormState
): Record<string, string> => {
  const nextErrors: Record<string, string> = {};

  if (!values.name.trim()) {
    nextErrors.name = 'Name is required';
  } else {
    const nameTextError = getPlainTextFieldValidationError(values.name);
    if (nameTextError) {
      nextErrors.name = nameTextError;
    }
  }

  const mobileDigits = values.mobile.replace(/\D/g, '');
  if (!mobileDigits) {
    nextErrors.mobile = 'Phone number is required';
  } else if (!isValidMobile(mobileDigits)) {
    // Same rule as auth / other lead forms: 10 digits, Indian mobile prefix 6–9.
    nextErrors.mobile = 'Enter a valid 10-digit mobile number starting with 6–9';
  }

  if (!values.address.trim()) {
    nextErrors.address = 'Address is required';
  } else {
    const addressTextError = getAddressFieldValidationError(values.address);
    if (addressTextError) {
      nextErrors.address = addressTextError;
    }
  }

  const pinDigits = values.areaPincode.replace(/\D/g, '');
  if (!pinDigits) {
    nextErrors.areaPincode = 'Area pincode is required';
  } else if (pinDigits.length !== 6) {
    nextErrors.areaPincode = 'Enter a valid 6-digit pincode';
  }

  const loan = parsePositiveInt(values.loanAmount, 'Required loan amount');
  if (loan.error) {
    nextErrors.loanAmount = loan.error;
  }

  if (!values.occupation) {
    nextErrors.occupation = 'Occupation is required';
  }

  const salary = parsePositiveInt(values.netSalaryPm, 'Net salary per month');
  if (salary.error) {
    nextErrors.netSalaryPm = salary.error;
  }

  if (!values.consent) {
    nextErrors.consent = 'Please accept the terms and privacy policy';
  }

  return nextErrors;
};

/**
 * Payload after validation; used for post-login pending action and submit API.
 * Excludes consent — that stays on the form state for UI/validation only.
 */
export interface PrimeplLeadEnquiryPayload {
  fullName: string;
  /** 10-digit mobile; sent as string in JSON per API sample. */
  phoneNumber: string;
  locationText: string;
  areaPincode: number;
  loanAmount: number;
  occupation: string;
  netSalaryPm: number;
  sourceChannel: string;
}

export const buildPrimeplLeadPayload = (
  values: PrimeplLeadFormState
): PrimeplLeadEnquiryPayload => {
  const mobileDigits = values.mobile.replace(/\D/g, '');
  const pinDigits = values.areaPincode.replace(/\D/g, '');
  const loanAmount = Number(values.loanAmount.replace(/\D/g, ''));
  const netSalaryPm = Number(values.netSalaryPm.replace(/\D/g, ''));

  return {
    fullName: values.name.trim(),
    phoneNumber: mobileDigits,
    locationText: values.address.trim(),
    areaPincode: Number(pinDigits),
    loanAmount,
    occupation: values.occupation,
    netSalaryPm,
    sourceChannel: PRIMEPL_DEFAULT_SOURCE_CHANNEL,
  };
};
