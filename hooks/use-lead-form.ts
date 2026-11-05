/**
 * Custom hook for lead form state management
 * Handles form values, validation, and step navigation
 * Dynamically renders fields based on API response
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { FormField, FormFieldKey } from '@/types/lead';
import { useAuth } from '@/hooks/use-auth';
import { getCookie } from 'cookies-next';
import { STORAGE_MOBILE } from '@/lib/constants/api-keys';
import {
  isValidCreditCardMaxAmountInput,
  sanitizeFormTextInput,
  sanitizeNumericInput,
  sanitizePanInput,
  getTextInputValidationError,
} from '@/lib/utils/form-helpers';
import { orderLeadFormFields } from '@/lib/utils/lead-form-modal-helpers';

interface WizardStep {
  stepNumber: number;
  title: string;
  fieldKeys: FormFieldKey[];
}

/**
 * Fixed field order per wizard screen (steps 1–4).
 * API-driven fields are filtered by these keys; flow-level gating (e.g. credit card) lives in the modal.
 */
const STEP_FIELD_MAPPING: Record<number, FormFieldKey[]> = {
  1: ['name', 'firstName', 'lastName', 'mobile', 'dob', 'email', 'gender', 'maritalStatus'],
  2: ['addressType', 'permanentAddress', 'pincode'],
  3: ['employmentType', 'salary', 'monthlyIncome', 'declaredIncome', 'loanAmount', 'requiredLoanAmount', 'modeOfSalary', 'companyName', 'companyAddress', 'companyPincode'],
  4: ['pan', 'hasCreditCard', 'creditCardLimit', 'consent'],
};

/** Hidden fields - auto-filled, never shown in UI */
const HIDDEN_FIELDS: FormFieldKey[] = ['ConsentIp', 'ConsentDateTime'];

/** Fields that require format validation */
const VALIDATION_PATTERNS: Record<string, RegExp> = {
  mobile: /^[0-9]{10}$/,
  phone: /^[0-9]{10}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  pincode: /^[0-9]{6}$/,
  companyPincode: /^[0-9]{6}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
};

const DOB_NATIVE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DOB_DASH_PATTERN = /^\d{2}-\d{2}-\d{4}$/;
const MINIMUM_AGE_YEARS = 18;

/** Free-text fields validated for emoji and special-character rules. */
const PLAIN_TEXT_FIELDS: FormFieldKey[] = [
  'name',
  'firstName',
  'lastName',
  'companyName',
];

/** Address fields that also allow comma and ampersand. */
const ADDRESS_TEXT_FIELDS: FormFieldKey[] = [
  'permanentAddress',
  'companyAddress',
];

/**
 * Normalize values that must stay numeric or uppercased even on prefill.
 */
const normalizeLeadFieldValue = (fieldKey: string, value: string): string => {
  if (ADDRESS_TEXT_FIELDS.includes(fieldKey as FormFieldKey)) {
    return sanitizeFormTextInput(value, 'address').replace(/\s+/g, ' ');
  }
  if (PLAIN_TEXT_FIELDS.includes(fieldKey as FormFieldKey)) {
    return sanitizeFormTextInput(value, 'plain').replace(/\s+/g, ' ');
  }
  if (fieldKey === 'email') {
    return sanitizeFormTextInput(value, 'email');
  }
  if (fieldKey === 'pan') {
    return sanitizePanInput(value);
  }
  if (fieldKey === 'pincode' || fieldKey === 'companyPincode') {
    return sanitizeNumericInput(value, 6);
  }
  // Max limit can be large (e.g. lakhs); cap digits to avoid accidental paste abuse.
  if (fieldKey === 'creditCardLimit') {
    return sanitizeNumericInput(value, 12);
  }
  if (fieldKey === 'requiredLoanAmount' || fieldKey === 'loanAmount') {
    return sanitizeNumericInput(value, 12);
  }
  return value;
};

interface UseLeadFormReturn {
  // State
  currentStep: number;
  formValues: Record<string, string>;
  formErrors: Record<string, string>;
  
  // Step management
  currentStepConfig: WizardStep;
  currentStepFields: FormField[];
  canGoBack: boolean;
  canGoNext: boolean;
  isSinglePage: boolean;
  
  // Actions
  handleFieldChange: (key: string, value: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  validateCurrentStep: () => boolean;
  validateField: (fieldKey: string) => void;
  initializeFormValues: (fields: FormField[], userIp: string) => void;
}

interface UseLeadFormOptions {
  singlePage?: boolean;
  consecutiveNameFields?: boolean;
}

const STEP_TITLES: Record<number, string> = {
  1: 'Personal Information',
  2: 'Address Information',
  3: 'Employment & Income',
  4: 'Identity Verification',
};

const SINGLE_PAGE_STEPS = [1, 2, 3, 4] as const;

export const useLeadForm = (
  fields: FormField[],
  options: UseLeadFormOptions = {}
): UseLeadFormReturn => {
  const { singlePage = false, consecutiveNameFields = false } = options;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fieldsLoaded, setFieldsLoaded] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();

  // Single-page flow shows all steps at once; merge keys from STEP_FIELD_MAPPING (1–4) in order.
  const mergedSinglePageFieldKeys = useMemo<FormFieldKey[]>(() => {
    const orderedKeys: FormFieldKey[] = [];
    SINGLE_PAGE_STEPS.forEach((stepNumber) => {
      (STEP_FIELD_MAPPING[stepNumber] || []).forEach((fieldKey) => {
        if (!orderedKeys.includes(fieldKey)) {
          orderedKeys.push(fieldKey);
        }
      });
    });
    return orderedKeys;
  }, []);

  /**
   * Get current step configuration
   */
  const getCurrentStepConfig = useCallback((): WizardStep => {
    if (singlePage) {
      return {
        stepNumber: 1,
        title: STEP_TITLES[1] || 'Step 1',
        fieldKeys: mergedSinglePageFieldKeys,
      };
    }

    const fieldKeys = STEP_FIELD_MAPPING[currentStep] || [];

    return {
      stepNumber: currentStep,
      title: STEP_TITLES[currentStep] || `Step ${currentStep}`,
      fieldKeys,
    };
  }, [currentStep, mergedSinglePageFieldKeys, singlePage]);

  /**
   * Get fields for current step, filtered and sorted
   */
  const getCurrentStepFields = useCallback((): FormField[] => {
    const step = getCurrentStepConfig();
    const visibleStepFields = fields.filter(
      f => step.fieldKeys.includes(f.key) && !HIDDEN_FIELDS.includes(f.key),
    );
    const stepFields = consecutiveNameFields
      ? orderLeadFormFields(visibleStepFields)
      : visibleStepFields.sort((a, b) => a.order - b.order);
    
    return stepFields;
  }, [consecutiveNameFields, fields, getCurrentStepConfig]);

  /**
   * Handle field value change
   */
  const handleFieldChange = useCallback((key: string, value: string): void => {
    const normalizedValue = normalizeLeadFieldValue(key, value);
    setFormValues((prev) => {
      const nextValues = { ...prev, [key]: normalizedValue };

      if (key === 'hasCreditCard') {
        nextValues.hasCreditCard = normalizedValue;

        if (normalizedValue === 'false') {
          nextValues.creditCardLimit = '';
        }
      }

      return nextValues;
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [formErrors]);

  /**
   * Validate DOB format (YYYY-MM-DD or DD-MM-YYYY) and enforce 18+ age rule.
   */
  const getDobValidationError = useCallback((value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return '';

    const isNativeFormat = DOB_NATIVE_PATTERN.test(trimmed);
    const isDashFormat = DOB_DASH_PATTERN.test(trimmed);

    if (!isNativeFormat && !isDashFormat) {
      return 'Please enter a valid date with a 4-digit year (YYYY)';
    }

    // Normalize to YYYY-MM-DD so we can compare dates safely.
    const [yearStr, monthStr, dayStr] = isNativeFormat
      ? trimmed.split('-')
      : (() => {
          const [day, month, year] = trimmed.split('-');
          return [year, month, day];
        })();

    if (yearStr.length !== 4) {
      return 'Please enter a valid date with a 4-digit year (YYYY)';
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if ([year, month, day].some((part) => Number.isNaN(part))) {
      return 'Please enter a valid date of birth';
    }

    const dobDate = new Date(year, month - 1, day);
    // Guard against invalid dates like 31-02-2000 rolling over.
    if (
      dobDate.getFullYear() !== year
      || dobDate.getMonth() !== month - 1
      || dobDate.getDate() !== day
    ) {
      return 'Please enter a valid date of birth';
    }

    const today = new Date();
    if (dobDate > today) {
      return 'Please enter a valid date of birth';
    }

    const ageCutoff = new Date(
      today.getFullYear() - MINIMUM_AGE_YEARS,
      today.getMonth(),
      today.getDate()
    );
    if (dobDate > ageCutoff) {
      return 'You must be at least 18 years old';
    }

    return '';
  }, []);

  /**
   * Get format validation error for a field
   */
  const getFieldFormatError = useCallback((fieldKey: string, value: string): string => {
    if (fieldKey === 'email') {
      const textError = getTextInputValidationError(value, 'email');
      if (textError) {
        return textError;
      }
    }

    if (ADDRESS_TEXT_FIELDS.includes(fieldKey as FormFieldKey)) {
      const textError = getTextInputValidationError(value, 'address');
      if (textError) {
        return textError;
      }
    }

    if (fieldKey === 'name' || PLAIN_TEXT_FIELDS.includes(fieldKey as FormFieldKey)) {
      const textError = getTextInputValidationError(value, 'plain');
      if (textError) {
        return textError;
      }
    }

    if (fieldKey === 'creditCardLimit') {
      const resolvedHasCreditCard = formValues.hasCreditCard;
      if (resolvedHasCreditCard !== 'true') {
        return '';
      }
      return isValidCreditCardMaxAmountInput(value)
        ? ''
        : 'Please enter a valid credit card limit amount';
    }

    if (fieldKey === 'dob') {
      return getDobValidationError(value);
    }

    // Reject 0 / non-positive amounts (no minimum-income rule here — see plan).
    if (fieldKey === 'salary' || fieldKey === 'loanAmount' || fieldKey === 'requiredLoanAmount') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return fieldKey === 'salary'
          ? 'Enter a valid monthly income'
          : 'Enter a valid loan amount';
      }
      return '';
    }

    const pattern = VALIDATION_PATTERNS[fieldKey];
    if (!pattern) return '';

    if (fieldKey === 'pan' && !pattern.test(value.toUpperCase())) {
      return 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }
    
    if (pattern && !pattern.test(value)) {
      switch (fieldKey) {
        case 'mobile':
        case 'phone':
          return 'Please enter a valid 10-digit mobile number';
        case 'email':
          return 'Please enter a valid email address';
        case 'pincode':
        case 'companyPincode':
          return 'Please enter a valid 6-digit pincode';
        default:
          return `Please enter a valid ${fieldKey}`;
      }
    }
    
    return '';
  }, [formValues.hasCreditCard, getDobValidationError]);

  /**
   * Validate a single field on blur
   */
  const validateField = useCallback((fieldKey: string): void => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return;

    const value = formValues[fieldKey] || '';
    let error = '';

    // Required validation based on isMandatory
    if (field.isMandatory && !value.trim()) {
      error = `${field.title} is required`;
    } else if (value.trim()) {
      // Format validation for fields with patterns
      error = getFieldFormatError(fieldKey, value);
    }

    if (error) {
      setFormErrors((prev) => ({ ...prev, [fieldKey]: error }));
    } else {
      // Clear error if validation passes
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  }, [formValues, fields, getFieldFormatError]);

  /**
   * Validate all fields in current step
   */
  const validateCurrentStep = useCallback((): boolean => {
    const currentFields = getCurrentStepFields();
    const errors: Record<string, string> = {};
    
    currentFields.forEach((field) => {
      const value = formValues[field.key] || '';
      
      // Required validation
      if (field.isMandatory && !value.trim()) {
        errors[field.key] = `${field.title} is required`;
      } else if (value.trim()) {
        // Format validation
        const formatError = getFieldFormatError(field.key, value);
        if (formatError) {
          errors[field.key] = formatError;
        }
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [getCurrentStepFields, formValues, getFieldFormatError]);

  /**
   * Scroll to first error field
   */
  const scrollToFirstError = useCallback((): void => {
    const firstError = document.querySelector('.border-red-300, input:invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  /**
   * Handle next step navigation
   * Auto-skips empty steps
   */
  const handleNext = useCallback((): void => {
    if (singlePage) {
      return;
    }
    if (!validateCurrentStep()) {
      scrollToFirstError();
      return;
    }
    
    // Auto-skip to next step if current step has no fields
    const currentFields = getCurrentStepFields();
    if (currentFields.length === 0 && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, [validateCurrentStep, scrollToFirstError, getCurrentStepFields, currentStep, singlePage]);

  /**
   * Handle back step navigation
   */
  const handleBack = useCallback((): void => {
    if (singlePage) {
      return;
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setFormErrors({});
  }, [singlePage]);

  /**
   * Initialize form values from API fields
   * Handles date conversion and special fields
   */
  const initializeFormValues = useCallback((fields: FormField[], userIp: string): void => {
    const initialValues: Record<string, string> = {};
    
    // Debug logging
    if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') {
      console.log('[useLeadForm] Initializing form values:', {
        totalFields: fields.length,
        userIp,
        fields: fields.map(f => ({
          key: f.key,
          title: f.title,
          type: f.type,
          value: f.value || '(empty)',
          isMandatory: f.isMandatory,
        })),
      });
    }
    
    fields.forEach((field) => {
      // Handle hidden/auto-filled fields
      if (field.key === 'ConsentIp') {
        initialValues[field.key] = userIp;
        return;
      }
      
      if (field.key === 'ConsentDateTime') {
        // Will be set on submit
        return;
      }
      
      // Handle date field - convert from DD-MM-YYYY to YYYY-MM-DD for native input
      if (field.key === 'dob') {
        const dateValue = field.value?.trim() || '';
        if (dateValue && /^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
          const [day, month, year] = dateValue.split('-');
          initialValues[field.key] = `${year}-${month}-${day}`;
        } else {
          initialValues[field.key] = dateValue;
        }
        return;
      }
      
      // Handle boolean fields
      if (field.type === 'boolean') {
        // For consent we want a safe default of "checked".
        // Backend might send an empty string for new users, so we only respect explicit false values.
        if (field.key === 'consent') {
          const lowerValue = field.value?.toLowerCase();
          const isExplicitFalse = lowerValue === 'false' || field.value === '0';
          initialValues[field.key] = isExplicitFalse ? 'false' : 'true';
        } else {
          // For non-consent boolean fields, preserve the backend intent exactly.
          const boolValue = field.value?.toLowerCase() === 'true' || field.value === '1';
          initialValues[field.key] = boolValue ? 'true' : 'false';
        }
        return;
      }
      
      const rawValue = field.value ?? '';

      if (
        field.key === 'pan'
        || PLAIN_TEXT_FIELDS.includes(field.key)
        || ADDRESS_TEXT_FIELDS.includes(field.key)
        || field.key === 'pincode'
        || field.key === 'companyPincode'
      ) {
        // Keep PAN and pincode values normalized even when the API pre-fills them.
        const normalized = normalizeLeadFieldValue(field.key, rawValue);
        const shouldTrim =
          PLAIN_TEXT_FIELDS.includes(field.key) ||
          ADDRESS_TEXT_FIELDS.includes(field.key);
        initialValues[field.key] = shouldTrim ? normalized.trim() : normalized;
        return;
      }

      // Default: use field value as-is
      initialValues[field.key] = rawValue.trim();
    });
    
    // Multi-lender one-page flow needs both consents regardless of API payload.
    // Default WeCredit consent to checked and partner consent to unchecked.
    if (singlePage) {
      initialValues.consent = 'true';
      initialValues.consentPartnerTerms = 'true';
    }

    setFormValues(initialValues);
  }, [singlePage]);

  /**
   * Auth prefill for mobile/phone:
   * When the user is authenticated, ensure the lead form has the same mobile number
   * that was used for login. This mirrors the behaviour in Business Loan and avoids
   * cases where the dynamic form API does not pre-populate the phone field.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const authMobileFromUser = user?.phoneNumber?.trim() ?? '';
    const authMobileFromCookie = (getCookie(STORAGE_MOBILE) as string | undefined)?.trim() ?? '';
    const effectiveMobile = authMobileFromUser || authMobileFromCookie;

    if (!effectiveMobile) {
      // If we do not have a reliable mobile number, do not touch form state.
      return;
    }

    const hasMobile = Boolean(formValues.mobile?.trim());
    const hasPhone = Boolean(formValues.phone?.trim());

    // If both fields already have values, we assume API or the user has set them intentionally.
    if (hasMobile && hasPhone) {
      return;
    }

    setFormValues((previousValues) => ({
      ...previousValues,
      ...(hasMobile ? {} : { mobile: effectiveMobile }),
      ...(hasPhone ? {} : { phone: effectiveMobile }),
    }));
  }, [formValues.mobile, formValues.phone, isAuthenticated, user]);

  // Reset to step 1 when fields are first loaded
  useEffect(() => {
    if (fields.length > 0 && !fieldsLoaded) {
      setFieldsLoaded(true);
      // Always start at step 1 when fields first load
      setCurrentStep(1);
    } else if (fields.length === 0) {
      setFieldsLoaded(false);
    }
  }, [fields.length, fieldsLoaded]);

  // Auto-skip empty steps only after fields have loaded
  // This prevents skipping when fields are still loading (empty array)
  useEffect(() => {
    // Don't auto-skip if fields haven't loaded yet
    if (!fieldsLoaded || fields.length === 0) {
      return;
    }
    
    if (singlePage) {
      return;
    }

    const stepFields = getCurrentStepFields();
    // Only skip if current step has no fields AND we're not on step 1
    // Always show step 1 first, even if it has no fields
    if (stepFields.length === 0 && currentStep < 4 && currentStep > 1) {
      // Auto-advance to next step if current step has no fields
      const timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStep, getCurrentStepFields, fieldsLoaded, fields.length, singlePage]);

  return {
    currentStep,
    formValues,
    formErrors,
    currentStepConfig: getCurrentStepConfig(),
    currentStepFields: getCurrentStepFields(),
    canGoBack: singlePage ? false : currentStep > 1,
    canGoNext: singlePage ? false : currentStep < 4,
    isSinglePage: singlePage,
    handleFieldChange,
    handleNext,
    handleBack,
    validateCurrentStep,
    validateField,
    initializeFormValues,
  };
};
