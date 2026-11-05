'use client';

import InputField from '@/components/forms/input-field';
import ButtonGroup from '@/components/forms/button-group';
import ConsentCheckbox from '@/components/forms/consent-checkbox';
import {
  PRIMEPL_OCCUPATION_OPTIONS,
  sanitizeNumericInput,
  type PrimeplLeadFormState,
} from './primepl-lead-form.config';

const occupationOptions = PRIMEPL_OCCUPATION_OPTIONS.map((option) => ({
  value: option,
  label: option === 'Self-employed' ? 'Self - employed' : option,
}));

interface PrimeplLeadFieldsProps {
  formValues: PrimeplLeadFormState;
  formErrors: Record<string, string>;
  handleFieldChange: (key: keyof PrimeplLeadFormState, value: string | boolean) => void;
  handleFieldBlur: (key: keyof PrimeplLeadFormState) => void;
}

const PrimeplLeadFields = ({
  formValues,
  formErrors,
  handleFieldChange,
  handleFieldBlur,
}: PrimeplLeadFieldsProps): React.ReactNode => {
  const consentError = formErrors.consent;

  return (
    <>
      <div>
        <label className="lead-form-label" htmlFor="primepl-lead-name">
          Name <span className="text-red-500">*</span>
        </label>
        <InputField
          id="primepl-lead-name"
          name="name"
          label="Name"
          value={formValues.name}
          onChange={(value) => handleFieldChange('name', value)}
          onBlur={() => handleFieldBlur('name')}
          placeholder="Full name"
          error={formErrors.name}
          required
          autoComplete="name"
        />
      </div>

      <div>
        <label className="lead-form-label" htmlFor="primepl-lead-mobile">
          Phone number <span className="text-red-500">*</span>
        </label>
        <InputField
          id="primepl-lead-mobile"
          name="mobile"
          label="Phone number"
          value={formValues.mobile}
          onChange={(value) => handleFieldChange('mobile', sanitizeNumericInput(value, 10))}
          onBlur={() => handleFieldBlur('mobile')}
          placeholder="Phone number"
          error={formErrors.mobile}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          required
          autoComplete="tel"
        />
      </div>

      <div>
        <label className="lead-form-label" htmlFor="primepl-lead-address">
          City <span className="text-red-500">*</span>
        </label>
        <InputField
          id="primepl-lead-address"
          name="address"
          label="City"
          value={formValues.address}
          onChange={(value) => handleFieldChange('address', value)}
          onBlur={() => handleFieldBlur('address')}
          placeholder="House no., street, city"
          error={formErrors.address}
          required
          textMode="address"
          autoComplete="street-address"
        />
      </div>

      <div>
        <label className="lead-form-label" htmlFor="primepl-lead-areaPincode">
          Area pincode <span className="text-red-500">*</span>
        </label>
        <InputField
          id="primepl-lead-areaPincode"
          name="areaPincode"
          label="Area pincode"
          value={formValues.areaPincode}
          onChange={(value) => handleFieldChange('areaPincode', sanitizeNumericInput(value, 6))}
          onBlur={() => handleFieldBlur('areaPincode')}
          placeholder="6-digit pincode"
          error={formErrors.areaPincode}
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
        />
      </div>

      <div>
        <label className="lead-form-label" htmlFor="primepl-lead-loanAmount">
          Required loan amount (₹) <span className="text-red-500">*</span>
        </label>
        <InputField
          id="primepl-lead-loanAmount"
          name="loanAmount"
          label="Required loan amount"
          value={formValues.loanAmount}
          onChange={(value) => handleFieldChange('loanAmount', sanitizeNumericInput(value, 12))}
          onBlur={() => handleFieldBlur('loanAmount')}
          placeholder="Amount in rupees"
          error={formErrors.loanAmount}
          type="text"
          inputMode="numeric"
          required
        />
      </div>

      <div>
        {/* div + id: not a <label> because the control is a button group, not a single focusable input. */}
        <div id="primepl-lead-occupation-label" className="lead-form-label">
          Employment Type <span className="text-red-500">*</span>
        </div>
        <ButtonGroup
          ariaLabelledBy="primepl-lead-occupation-label"
          options={occupationOptions}
          value={formValues.occupation}
          onChange={(value) =>
            handleFieldChange('occupation', value as PrimeplLeadFormState['occupation'])
          }
          error={formErrors.occupation}
        />
      </div>

      <div>
        <label className="lead-form-label" htmlFor="primepl-lead-netSalaryPm">
          Net salary per month (₹) <span className="text-red-500">*</span>
        </label>
        <InputField
          id="primepl-lead-netSalaryPm"
          name="netSalaryPm"
          label="Net salary per month"
          value={formValues.netSalaryPm}
          onChange={(value) => handleFieldChange('netSalaryPm', sanitizeNumericInput(value, 12))}
          onBlur={() => handleFieldBlur('netSalaryPm')}
          placeholder="Monthly net salary"
          error={formErrors.netSalaryPm}
          type="text"
          inputMode="numeric"
          required
        />
      </div>

      <ConsentCheckbox
        id="primepl-lead-consent"
        checked={formValues.consent}
        onChange={(value) => handleFieldChange('consent', value)}
        error={consentError}
      />
    </>
  );
};

export default PrimeplLeadFields;
