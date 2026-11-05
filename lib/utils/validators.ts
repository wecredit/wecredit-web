/**
 * Form Validators
 * Validation functions for lead creation form fields
 */

import {
  getTextInputValidationError,
  type FormTextInputMode,
} from '@/lib/utils/form-helpers';

export { getTextInputValidationError, type FormTextInputMode };

/** Returns a validation error for plain-text fields, or an empty string when valid. */
export function getPlainTextFieldValidationError(value: string): string {
  return getTextInputValidationError(value, 'plain');
}

/** Returns a validation error for address fields (allows commas etc.), or empty when valid. */
export function getAddressFieldValidationError(value: string): string {
  return getTextInputValidationError(value, 'address');
}

/** Returns a validation error for email fields (emoji-only check), or an empty string when valid. */
export function getEmailTextValidationError(value: string): string {
  return getTextInputValidationError(value, 'email');
}

/** PAN Card validation regex (ABCDE1234F format) */
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Email validation regex */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Indian mobile number regex (10 digits, starts with 6-9) */
const MOBILE_REGEX = /^[6-9]\d{9}$/;

/** Indian PIN code regex (6 digits, doesn't start with 0) */
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Validates PAN card number
 * Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
 * @param pan - PAN number to validate
 * @returns true if valid, false otherwise
 */
export function validatePAN(pan: string): boolean {
  if (!pan) return false;
  return PAN_REGEX.test(pan.toUpperCase());
}

/**
 * Gets PAN validation error message
 * @param pan - PAN number to validate
 * @returns Error message or empty string if valid
 */
export function getPANError(pan: string): string {
  if (!pan) return 'PAN number is required';
  if (!PAN_REGEX.test(pan.toUpperCase())) {
    return 'Invalid PAN format. Example: ABCDE1234F';
  }
  return '';
}

/**
 * Validates email address
 * @param email - Email to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
}

/**
 * Gets email validation error message
 * @param email - Email to validate
 * @returns Error message or empty string if valid
 */
export function getEmailError(email: string): string {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
}

/**
 * Validates Indian mobile number
 * Must be 10 digits and start with 6-9
 * @param mobile - Mobile number to validate
 * @returns true if valid, false otherwise
 */
export function validateMobile(mobile: string): boolean {
  if (!mobile) return false;
  const cleanMobile = mobile.replace(/\D/g, '');
  return MOBILE_REGEX.test(cleanMobile);
}

/**
 * Gets mobile validation error message
 * @param mobile - Mobile number to validate
 * @returns Error message or empty string if valid
 */
export function getMobileError(mobile: string): string {
  if (!mobile) return 'Mobile number is required';
  const cleanMobile = mobile.replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    return 'Mobile number must be 10 digits';
  }
  if (!MOBILE_REGEX.test(cleanMobile)) {
    return 'Please enter a valid Indian mobile number';
  }
  return '';
}

/**
 * Validates Indian PIN code
 * Must be 6 digits and not start with 0
 * @param pincode - PIN code to validate
 * @returns true if valid, false otherwise
 */
export function validatePincode(pincode: string): boolean {
  if (!pincode) return false;
  return PINCODE_REGEX.test(pincode);
}

/**
 * Gets PIN code validation error message
 * @param pincode - PIN code to validate
 * @returns Error message or empty string if valid
 */
export function getPincodeError(pincode: string): string {
  if (!pincode) return 'PIN code is required';
  if (pincode.length !== 6) {
    return 'PIN code must be 6 digits';
  }
  if (!PINCODE_REGEX.test(pincode)) {
    return 'Please enter a valid PIN code';
  }
  return '';
}

/**
 * Validates date of birth (must be 18+ years old)
 * @param dob - Date of birth in DD-MM-YYYY format
 * @returns true if valid and 18+, false otherwise
 */
export function validateDOB(dob: string): boolean {
  if (!dob) return false;
  const parts = dob.split('-');
  if (parts.length !== 3) return false;
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;
  const birthDate = new Date(year, month - 1, day);
  if (isNaN(birthDate.getTime())) return false;
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  return actualAge >= 18;
}

/**
 * Gets DOB validation error message
 * @param dob - Date of birth to validate
 * @returns Error message or empty string if valid
 */
export function getDOBError(dob: string): string {
  if (!dob) return 'Date of birth is required';
  const parts = dob.split('-');
  if (parts.length !== 3) {
    return 'Please enter date in DD-MM-YYYY format';
  }
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return 'Please enter a valid date';
  }
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return 'Please enter a valid date';
  }
  const birthDate = new Date(year, month - 1, day);
  if (isNaN(birthDate.getTime())) {
    return 'Please enter a valid date';
  }
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  if (actualAge < 18) {
    return 'You must be at least 18 years old';
  }
  return '';
}

/**
 * Validates salary (minimum 10000)
 * @param salary - Monthly salary (can include commas)
 * @returns true if valid and >= 10000, false otherwise
 */
export function validateSalary(salary: string): boolean {
  if (!salary) return false;
  const amount = parseFloat(salary.replace(/,/g, ''));
  return !isNaN(amount) && amount >= 10000;
}

/**
 * Gets salary validation error message
 * @param salary - Salary to validate
 * @returns Error message or empty string if valid
 */
export function getSalaryError(salary: string): string {
  if (!salary) return 'Monthly income is required';
  const amount = parseFloat(salary.replace(/,/g, ''));
  if (isNaN(amount)) {
    return 'Please enter a valid amount';
  }
  if (amount < 10000) {
    return 'Minimum monthly income should be ₹10,000';
  }
  return '';
}

/**
 * Validates name (alphabets and spaces only)
 * @param name - Name to validate
 * @returns true if valid, false otherwise
 */
export function validateName(name: string): boolean {
  if (!name || !name.trim()) return false;
  return /^[a-zA-Z\s]+$/.test(name.trim());
}

/**
 * Gets name validation error message
 * @param name - Name to validate
 * @returns Error message or empty string if valid
 */
export function getNameError(name: string): string {
  if (!name || !name.trim()) return 'Name is required';
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return 'Name should contain only alphabets';
  }
  return '';
}
