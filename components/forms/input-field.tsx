/**
 * Input Field Component
 * Reusable form input with label, helper text, and error handling
 */

import { cn } from '@/lib/utils';
import { sanitizeFormTextInput, type FormTextInputMode } from '@/lib/utils/form-helpers';

interface InputFieldProps {
  label: string;
  /** Associates a visible <label htmlFor="..."> with this control; required for autofill hints in DevTools. */
  id?: string;
  /** Submitted field name; also helps browsers autofill when paired with autocomplete. */
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  helperText?: string;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'email' | 'tel';
  /** Overrides auto-detected sanitization (e.g. address allows comma and &). */
  textMode?: FormTextInputMode;
  maxLength?: number;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

const InputField = ({
  label,
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  placeholder,
  helperText,
  type = 'text',
  inputMode = 'text',
  textMode,
  maxLength,
  required,
  autoComplete,
  className,
}: InputFieldProps) => {
  const errorId = id ? `${id}-error` : undefined;

  const resolveTextInputMode = (): FormTextInputMode | null => {
    if (textMode) {
      return textMode;
    }
    if (type === 'email' || inputMode === 'email') {
      return 'email';
    }
    if (type === 'tel' || inputMode === 'numeric' || inputMode === 'tel') {
      return null;
    }
    return 'plain';
  };

  const handleChange = (rawValue: string): void => {
    const textInputMode = resolveTextInputMode();
    const nextValue = textInputMode
      ? sanitizeFormTextInput(rawValue, textInputMode)
      : rawValue;
    onChange(nextValue);
  };

  return (
    <div className="space-y-2">
      {/* <label className="block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label> */}

      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        className={cn(
          'w-full px-4 py-3 rounded-lg border text-base transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          // Hide number input spinners
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
          (disabled || readOnly) && 'opacity-50',
          className
        )}
      />

      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
