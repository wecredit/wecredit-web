'use client';

import InputField from '@/components/forms/input-field';
import ConsentCheckbox from '@/components/forms/consent-checkbox';
import DateOfBirthField from '@/components/forms/date-of-birth-field';
import ButtonGroup from '@/components/forms/button-group';
import {
  CREDIT_CARD_ADDRESS_TYPE_OPTIONS,
  CREDIT_CARD_EMPLOYMENT_OPTIONS,
  CREDIT_CARD_GENDER_OPTIONS,
  sanitizeNumericInput,
  type CreditCardFormState,
} from './credit-card-form.config';
import { useAuth } from '@/hooks/use-auth';
import type { CreditCardFieldsProps } from './credit-card-fields.types';

const INPUT_CLASS_NAME = 'py-2 text-xs md:py-3 md:text-base';
const OPTION_CLASS_NAME = 'text-xs md:text-sm';

const CreditCardFields = ({
  formValues,
  formErrors,
  handleFieldChange,
  handleFieldBlur,
}: CreditCardFieldsProps): React.ReactNode => {
  const { isAuthenticated } = useAuth();
  const genderOptions = CREDIT_CARD_GENDER_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  }));
  const employmentOptions = CREDIT_CARD_EMPLOYMENT_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  }));
  const addressTypeOptions = CREDIT_CARD_ADDRESS_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  return (
    <>
      <div>
        <label className="lead-form-label">
          Full Name <span className="text-red-500">*</span>
        </label>
        <InputField
          label="Full Name"
          value={formValues.customerName}
          onChange={(value) => handleFieldChange('customerName', value)}
          onBlur={() => handleFieldBlur('customerName')}
          placeholder="Enter your full name"
          error={formErrors.customerName}
          required
          autoComplete="name"
          className={INPUT_CLASS_NAME}
        />
      </div>

      <div>
        <label className="lead-form-label">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <InputField
          label="Phone Number"
          value={formValues.mobile}
          onChange={(value) =>
            handleFieldChange('mobile', sanitizeNumericInput(value, 10))
          }
          onBlur={() => handleFieldBlur('mobile')}
          placeholder="Phone Number"
          error={formErrors.mobile}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          required
          disabled={isAuthenticated}
          autoComplete="tel"
          className={INPUT_CLASS_NAME}
        />
      </div>

      <div>
        <DateOfBirthField
          id="credit-card-dob"
          value={formValues.dob}
          onChange={(value) => handleFieldChange('dob', value)}
          onBlur={() => handleFieldBlur('dob')}
          error={formErrors.dob}
          hint="Enter your Date of Birth as per PAN card"
        />
      </div>

      <div>
        <label className="lead-form-label">
          PAN Card <span className="text-red-500">*</span>
        </label>
        <InputField
          label="PAN Card"
          value={formValues.pan}
          onChange={(value) => handleFieldChange('pan', value.toUpperCase())}
          onBlur={() => handleFieldBlur('pan')}
          placeholder="ABCDE1234F"
          error={formErrors.pan}
          maxLength={10}
          required
          className={INPUT_CLASS_NAME}
        />
      </div>

      <div>
        <label className="lead-form-label">
          Gender <span className="text-red-500">*</span>
        </label>
        <ButtonGroup
          options={genderOptions}
          value={formValues.gender}
          onChange={(value) =>
            handleFieldChange('gender', value as CreditCardFormState['gender'])
          }
          error={formErrors.gender}
          buttonClassName={OPTION_CLASS_NAME}
        />
      </div>

      <div>
        <label className="lead-form-label">
          Employment Type <span className="text-red-500">*</span>
        </label>
        <ButtonGroup
          options={employmentOptions}
          value={formValues.employmentType}
          onChange={(value) =>
            handleFieldChange(
              'employmentType',
              value as CreditCardFormState['employmentType']
            )
          }
          error={formErrors.employmentType}
          buttonClassName={OPTION_CLASS_NAME}
        />
      </div>

      <div>
        <label className="lead-form-label">
          Monthly Income <span className="text-red-500">*</span>
        </label>
        <InputField
          label="Monthly Income"
          value={formValues.monthlyIncome}
          onChange={(value) =>
            handleFieldChange('monthlyIncome', sanitizeNumericInput(value, 9))
          }
          onBlur={() => handleFieldBlur('monthlyIncome')}
          placeholder="Enter monthly income"
          error={formErrors.monthlyIncome}
          type="text"
          inputMode="numeric"
          required
          className={INPUT_CLASS_NAME}
        />
      </div>

      <div>
        <label className="lead-form-label">
          Pincode <span className="text-red-500">*</span>
        </label>
        <InputField
          label="Pincode"
          value={formValues.pincode}
          onChange={(value) =>
            handleFieldChange('pincode', sanitizeNumericInput(value, 6))
          }
          onBlur={() => handleFieldBlur('pincode')}
          placeholder="Enter pincode"
          error={formErrors.pincode}
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          className={INPUT_CLASS_NAME}
        />
      </div>

      <div>
        <label className="lead-form-label">
          Address Type <span className="text-red-500">*</span>
        </label>
        <ButtonGroup
          options={addressTypeOptions}
          value={formValues.addressType}
          onChange={(value) =>
            handleFieldChange(
              'addressType',
              value as CreditCardFormState['addressType']
            )
          }
          error={formErrors.addressType}
          buttonClassName={OPTION_CLASS_NAME}
        />
      </div>

      <div>
        <label className="lead-form-label">
          Address <span className="text-red-500">*</span>
        </label>
        <InputField
          label="Address"
          value={formValues.address}
          onChange={(value) => handleFieldChange('address', value)}
          onBlur={() => handleFieldBlur('address')}
          placeholder="Enter your address"
          error={formErrors.address}
          required
          autoComplete="street-address"
          className={INPUT_CLASS_NAME}
        />
      </div>

      <ConsentCheckbox
        id="credit-card-consent"
        checked={formValues.consent}
        onChange={(checked) => handleFieldChange('consent', checked)}
        error={formErrors.consent}
      />
    </>
  );
};

export default CreditCardFields;
