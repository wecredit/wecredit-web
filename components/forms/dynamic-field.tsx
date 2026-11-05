/**
 * Dynamic Field Component
 * Renders appropriate UI component based on field configuration from API
 * Supports text inputs, number inputs, date inputs, button groups, select dropdowns, and checkboxes
 */

import { cn } from '@/lib/utils';
import {
  formatDobForDisplay,
  getDobMaxDate,
  normalizeDobTextInput,
  sanitizeFormTextInput,
  sanitizeNumericInput,
  sanitizePanInput,
} from '@/lib/utils/form-helpers';
import type { FormField, FormFieldKey } from '@/types/lead';
import ButtonGroup from './button-group';
import ConsentCheckbox from './consent-checkbox';
import Link from 'next/link';

interface DynamicFieldProps {
  /** Field configuration from API */
  field: FormField;
  /** Current field value */
  value: string;
  /** Change handler for field value */
  onChange: (value: string) => void;
  /** Blur handler for validation */
  onBlur?: () => void;
  /** Validation error message */
  error?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Visual theme for lender-specific branding */
  theme?: 'default' | 'moneyview';
  /** Resolved lender color for checkbox controls */
  checkboxColor?: string;
}

const FIELD_THEMES = {
  default: {
    buttonSelected: 'bg-blue-50 border-blue-600 text-blue-600',
    buttonFocus: 'focus:ring-blue-500',
    checkbox: 'accent-blue-600 focus:ring-blue-500',
    inputFocus: 'focus:ring-blue-500',
    link: 'text-blue-600',
  },
  moneyview: {
    buttonSelected: 'bg-mv-green/10 border-mv-green text-mv-green',
    buttonFocus: 'focus:ring-mv-green',
    checkbox: 'accent-mv-green focus:ring-mv-green',
    inputFocus: 'focus:ring-mv-green',
    link: 'text-mv-green',
  },
} as const;

/** Fields that should be hidden (auto-filled, never shown) */
const HIDDEN_FIELDS: FormFieldKey[] = ['ConsentIp', 'ConsentDateTime'];

/** Fields that should use email input type */
const EMAIL_FIELDS: FormFieldKey[] = ['email'];

/** Fields that should use date input type */
const DATE_FIELDS: FormFieldKey[] = ['dob'];

/** Fields that should use tel input type */
const PHONE_FIELDS: FormFieldKey[] = ['mobile', 'phone'];

/** Fields that should use numeric input mode */
const NUMERIC_FIELDS: FormFieldKey[] = ['pincode', 'companyPincode', 'salary', 'monthlyIncome', 'declaredIncome', 'loanAmount', 'requiredLoanAmount', 'creditCardLimit'];

/**
 * Capitalizes first letter of each word for display
 * Handles camelCase by splitting on capital letters
 */
function capitalizeOption(option: string): string {
  return option
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Gets the HTML input type based on field key and type
 */
function getInputType(key: FormFieldKey, fieldType: string): string {
  if (EMAIL_FIELDS.includes(key)) return 'email';
  if (DATE_FIELDS.includes(key)) return 'date';
  if (PHONE_FIELDS.includes(key)) return 'tel';
  if (fieldType === 'boolean') return 'checkbox';
  return 'text';
}

/**
 * Gets the input mode for mobile keyboards
 */
function getInputMode(key: FormFieldKey, fieldType: string): 'text' | 'numeric' | 'email' | 'tel' {
  if (EMAIL_FIELDS.includes(key)) return 'email';
  if (PHONE_FIELDS.includes(key)) return 'tel';
  if (NUMERIC_FIELDS.includes(key) || fieldType === 'number' || fieldType === 'float') return 'numeric';
  return 'text';
}

/**
 * Gets placeholder text for a field
 */
function getPlaceholder(key: FormFieldKey, title: string): string {
  if (DATE_FIELDS.includes(key)) return '';
  if (PHONE_FIELDS.includes(key)) return 'Enter 10-digit mobile number';
  if (key === 'pan') return 'Enter PAN (e.g., ABCDE1234F)';
  if (key === 'pincode' || key === 'companyPincode') return 'Enter 6-digit PIN code';
  return `Enter ${title.toLowerCase()}`;
}

/**
 * Gets max length for input fields
 */
function getMaxLength(key: FormFieldKey): number | undefined {
  if (PHONE_FIELDS.includes(key)) return 10;
  if (key === 'pan') return 10;
  if (key === 'pincode' || key === 'companyPincode') return 6;
  if (key === 'loanAmount' || key === 'requiredLoanAmount' || key === 'creditCardLimit') return 12;
  return undefined;
}

/**
 * Converts date from DD-MM-YYYY (API format) to YYYY-MM-DD (native date input format)
 */
function convertDateToNativeFormat(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

/**
 * Converts date from YYYY-MM-DD (native date input) to DD-MM-YYYY (API format)
 */
function convertDateToApiFormat(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }
  return dateStr;
}

/**
 * iOS Safari date inputs are inconsistent with max/min constraints inside modals.
 * Use a text input fallback to keep DOB entry predictable.
 */
function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isIpadOs = ua.includes('Mac') && navigator.maxTouchPoints > 1;
  return isAppleMobile || isIpadOs;
}

/** Free-text fields that allow letters, digits, and spaces only. */
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
 * Normalizes user input for fields that need strict formatting.
 */
function normalizeFieldValue(key: FormFieldKey, value: string): string {
  if (key === 'pan') {
    return sanitizePanInput(value);
  }
  if (NUMERIC_FIELDS.includes(key)) {
    return sanitizeNumericInput(value, getMaxLength(key));
  }
  if (EMAIL_FIELDS.includes(key)) {
    return sanitizeFormTextInput(value, 'email');
  }
  if (ADDRESS_TEXT_FIELDS.includes(key)) {
    return sanitizeFormTextInput(value, 'address');
  }
  if (PLAIN_TEXT_FIELDS.includes(key)) {
    return sanitizeFormTextInput(value, 'plain');
  }
  return sanitizeFormTextInput(value, 'plain');
}

const DynamicField = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  theme = 'default',
  checkboxColor,
}: DynamicFieldProps) => {
  const { title, key, type, options, isMandatory } = field;
  const themeStyles = FIELD_THEMES[theme];

  if (key === 'hasCreditCard') {
    return (
      <div className="space-y-2">
        <p className="lead-form-label" id={`${key}-label`}>
          {title} {isMandatory && <span className="text-red-500">*</span>}
        </p>
        <div role="group" aria-labelledby={`${key}-label`}>
          <ButtonGroup
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
            className="gap-3"
            selectedClassName={themeStyles.buttonSelected}
            buttonClassName={cn(
              'py-3 text-base focus:outline-none focus:ring-2 focus:ring-offset-2',
              themeStyles.buttonFocus,
            )}
          />
        </div>
      </div>
    );
  }

  // Some lender form payloads omit `options` for `modeOfSalary` (leaving it as a free-text input).
  // For better UX, we fall back to a 3-option button group when options are missing.
  const shouldUseModeOfSalaryFallbackOptions = key === 'modeOfSalary' && options.length === 0;

  // Skip hidden fields (ConsentIp, ConsentDateTime - auto-filled)
  if (HIDDEN_FIELDS.includes(key)) {
    return null;
  }

  // Handle boolean field (consent) as checkbox
  if (type === 'boolean') {
    const isChecked = value === 'true';
    // Unity lender-specific consent text
    if (field.lenderName === 'unity') {
      return (
        <div className="space-y-2">
          <div className="flex items-start gap-3">
              <input
              type="checkbox"
              id={key}
              checked={isChecked}
              onChange={(event) => onChange(event.target.checked ? 'true' : 'false')}
              style={{ accentColor: checkboxColor }}
              className={cn(
                'mt-1 h-5 w-5 min-w-[20px] min-h-[20px] rounded border-gray-300 cursor-pointer shrink-0',
                themeStyles.checkbox,
              )}            />
           <label htmlFor={key} className="text-sm text-gray-700 leading-relaxed">
  {title}
</label>
          </div>
          {error && (
            <p className="text-xs text-red-600 ml-8">{error}</p>
          )}
        </div>
      );
    }
    // Default consent text
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id={key}
            checked={isChecked}
            onChange={(event) => onChange(event.target.checked ? 'true' : 'false')}
            style={{ accentColor: checkboxColor }}
                          className={cn(
                'mt-1 h-5 w-5 min-w-[20px] min-h-[20px] rounded border-gray-300 cursor-pointer shrink-0',
                themeStyles.checkbox,
              )}
          />
          <label htmlFor={key} className="text-sm text-gray-700">
  {key === 'consent' ? (
    <>
    I agree to the{' '}
    <Link target="_blank" href="/terms-of-service" className={cn('underline', themeStyles.link)}>
      Terms of Service
    </Link>{' '}
    of WeCredit.
  </>
  ) : (
    title
  )}
</label>
        </div>
        {error && (
          <p className="text-xs text-red-600 ml-8">{error}</p>
        )}
      </div>
    );
  }

  // Handle selection fields with options
  const resolvedOptions = shouldUseModeOfSalaryFallbackOptions
    ? ['cash', 'upi', 'bankTransfer']
    : options;

  if (resolvedOptions.length > 0) {
    // Use ButtonGroup for 2-4 options (better UX for small sets)
    if (resolvedOptions.length >= 2 && resolvedOptions.length <= 4) {
      const buttonOptions =
        shouldUseModeOfSalaryFallbackOptions
          ? [
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'bankTransfer', label: 'Bank Transfer' },
            ]
          : resolvedOptions.map((opt) => ({
              value: opt,
              label: capitalizeOption(opt),
            }));

      return (
        <div className="space-y-2">
          <label className="lead-form-label">
            {title} {isMandatory && <span className="text-red-500">*</span>}
          </label>
          <ButtonGroup
            options={buttonOptions}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
            selectedClassName={themeStyles.buttonSelected}
          />
        </div>
      );
    }

    // Use Select dropdown for 5+ options
    return (
      <div className="space-y-2">
        <label htmlFor={key} className="lead-form-label">
          {title} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            id={key}
            name={key}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={isMandatory}
            disabled={disabled}
          className={cn(
            'w-full px-4 py-3 rounded-lg border text-base transition-colors',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            themeStyles.inputFocus,
            'appearance-none bg-white pr-10 cursor-pointer',
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <option value="" disabled>
              Select {title}
            </option>
            {resolvedOptions.map((option) => (
              <option key={option} value={option}>
                {capitalizeOption(option)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  // Handle date field - use native date input
  if (DATE_FIELDS.includes(key)) {
    const isIos = isIOSDevice();
    const nativeDateValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : convertDateToNativeFormat(value);
    const textDateValue = formatDobForDisplay(value);
    const maxDobDate = getDobMaxDate(18);
    
    return (
      <div className="space-y-2">
        <label htmlFor={key} className="lead-form-label">
          {title} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        <input
          id={key}
          name={key}
          type={isIos ? 'text' : 'date'}
          inputMode={isIos ? 'numeric' : undefined}
          placeholder={isIos ? 'DD-MM-YYYY' : undefined}
          maxLength={isIos ? 10 : undefined}
          value={isIos ? textDateValue : nativeDateValue}
          onChange={(e) => {
            const nextValue = isIos
              ? normalizeDobTextInput(e.target.value)
              : e.target.value;
            // iOS uses DD-MM-YYYY text entry; non-iOS uses native YYYY-MM-DD.
            onChange(nextValue);
          }}
          onBlur={onBlur}
          max={isIos ? undefined : maxDobDate}
          required={isMandatory}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 rounded-lg border text-base transition-colors',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            themeStyles.inputFocus,
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  // Handle phone fields - restrict to 10 digits
  if (PHONE_FIELDS.includes(key)) {
    const handlePhoneChange = (val: string): void => {
      const numericValue = val.replace(/\D/g, '').slice(0, 10);
      onChange(numericValue);
    };

    return (
      <div className="space-y-2">
        <label htmlFor={key} className="lead-form-label">
          {title} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        <input
          id={key}
          name={key}
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onBlur={onBlur}
          required={isMandatory}
          disabled={disabled}
          placeholder={getPlaceholder(key, title)}
          maxLength={10}
          className={cn(
            'w-full px-4 py-3 rounded-lg border text-base transition-colors',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            themeStyles.inputFocus,
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  // Render standard text/number input field
  return (
    <div className="space-y-2">
      <label htmlFor={key} className="lead-form-label">
        {title} {isMandatory && <span className="text-red-500">*</span>}
      </label>
      <input
        id={key}
        name={key}
        type={getInputType(key, type)}
        inputMode={getInputMode(key, type)}
        value={value}
        onChange={(e) => {
          const normalizedValue = normalizeFieldValue(key, e.target.value);
          onChange(normalizedValue);
        }}
        onBlur={onBlur}
        required={isMandatory}
        disabled={disabled}
        placeholder={getPlaceholder(key, title)}
        maxLength={getMaxLength(key)}
        className={cn(
          'w-full px-4 py-3 rounded-lg border text-base transition-colors',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          themeStyles.inputFocus,
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default DynamicField;
