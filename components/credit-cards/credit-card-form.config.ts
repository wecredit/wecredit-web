/**
 * Credit card application form: state, validation, and API payload builder.
 */

import {
  isValidDobFormat,
  normalizePan,
  sanitizeNumericInput,
} from '@/lib/utils/form-helpers';
import { getPlainTextFieldValidationError } from '@/lib/utils/validators';
import type { CreditCardLeadPayload } from '@/types/credit-card';

export { sanitizeNumericInput };

export type CreditCardGender = 'male' | 'female';
export type CreditCardEmploymentType = 'salaried' | 'self-employed';
export type CreditCardAddressType = 'current' | 'permanent';

export interface CreditCardFormState {
  customerName: string;
  mobile: string;
  pan: string;
  monthlyIncome: string;
  pincode: string;
  gender: CreditCardGender;
  employmentType: CreditCardEmploymentType;
  dob: string;
  address: string;
  addressType: CreditCardAddressType;
  consent: boolean;
}

export const CREDIT_CARD_GENDER_OPTIONS: Array<{
  label: string;
  value: CreditCardGender;
}> = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

export const CREDIT_CARD_EMPLOYMENT_OPTIONS: Array<{
  label: string;
  value: CreditCardEmploymentType;
}> = [
  { label: 'Salaried', value: 'salaried' },
  { label: 'Self-employed', value: 'self-employed' },
];

export const CREDIT_CARD_ADDRESS_TYPE_OPTIONS: Array<{
  label: string;
  value: CreditCardAddressType;
}> = [
  { label: 'Current', value: 'current' },
  { label: 'Permanent', value: 'permanent' },
];

export const DEFAULT_CREDIT_CARD_FORM_STATE: CreditCardFormState = {
  customerName: '',
  mobile: '',
  pan: '',
  monthlyIncome: '',
  pincode: '',
  gender: 'male',
  employmentType: 'salaried',
  dob: '',
  address: '',
  addressType: 'current',
  consent: true,
};

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/**
 * Converts DOB from form storage to YYYY-MM-DD for credit-card-lead.
 */
export function formatCreditCardDobForApi(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (!trimmed) {
    return '';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/');
    return `${year}-${month}-${day}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('-');
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

export function validateCreditCardForm(
  values: CreditCardFormState
): Record<string, string> {
  const nextErrors: Record<string, string> = {};
  if (!values.customerName.trim()) {
    nextErrors.customerName = 'Full name is required';
  } else {
    const nameError = getPlainTextFieldValidationError(values.customerName);
    if (nameError) {
      nextErrors.customerName = nameError;
    }
  }
  const mobileDigits = values.mobile.replace(/\D/g, '');
  if (!mobileDigits) {
    nextErrors.mobile = 'Phone number is required';
  } else if (mobileDigits.length !== 10) {
    nextErrors.mobile = 'Enter a valid 10-digit phone number';
  }
  if (!values.dob.trim()) {
    nextErrors.dob = 'Date of birth is required';
  } else if (!isValidDobFormat(values.dob)) {
    nextErrors.dob = 'Enter a valid date of birth';
  }
  const panUpper = normalizePan(values.pan);
  if (!panUpper) {
    nextErrors.pan = 'PAN is required';
  } else if (!PAN_REGEX.test(panUpper)) {
    nextErrors.pan = 'Enter a valid PAN (e.g. ABCDE1234F)';
  }
  const incomeDigits = values.monthlyIncome.replace(/\D/g, '');
  if (!incomeDigits) {
    nextErrors.monthlyIncome = 'Monthly income is required';
  } else if (Number(incomeDigits) <= 0) {
    nextErrors.monthlyIncome = 'Enter a valid monthly income';
  }
  const pincodeDigits = values.pincode.replace(/\D/g, '');
  if (!pincodeDigits) {
    nextErrors.pincode = 'Pincode is required';
  } else if (pincodeDigits.length !== 6) {
    nextErrors.pincode = 'Enter a valid 6-digit pincode';
  }
  if (!values.gender) {
    nextErrors.gender = 'Gender is required';
  }
  if (!values.employmentType) {
    nextErrors.employmentType = 'Employment type is required';
  }
  if (!values.address.trim()) {
    nextErrors.address = 'Address is required';
  }
  if (!values.addressType) {
    nextErrors.addressType = 'Address type is required';
  }
  if (!values.consent) {
    nextErrors.consent = 'Please accept the terms to continue';
  }
  return nextErrors;
}

export function buildCreditCardLeadPayload(
  values: CreditCardFormState,
  creditCardName: string
): CreditCardLeadPayload {
  return {
    customerName: values.customerName.trim(),
    mobile: values.mobile.replace(/\D/g, ''),
    creditCardName: creditCardName.trim(),
    pan: normalizePan(values.pan),
    monthlyIncome: Number(values.monthlyIncome.replace(/\D/g, '')),
    pincode: Number(values.pincode.replace(/\D/g, '')),
    gender: values.gender,
    employmentType: values.employmentType,
    dob: formatCreditCardDobForApi(values.dob),
    address: values.address.trim(),
    addressType: values.addressType,
  };
}
