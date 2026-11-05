import type { CreditCardFormState } from './credit-card-form.config';

export interface CreditCardFieldsProps {
  formValues: CreditCardFormState;
  formErrors: Record<string, string>;
  handleFieldChange: (
    key: keyof CreditCardFormState,
    value: string | boolean
  ) => void;
  handleFieldBlur: (key: keyof CreditCardFormState) => void;
}
