'use client';

import { LoanProductSplitLayout, type LoanFeatureItem } from '@/components/shared';
import { IMAGES } from '@/lib/constants/images';
import CreditCardFields from './credit-card-fields';
import { useCreditCardForm } from './use-credit-card-form';
import type { CreditCardFormProps } from './credit-card-form.types';

const CREDIT_CARD_FEATURES: readonly LoanFeatureItem[] = [
  {
    title: 'Quick Apply',
    description: 'Share details once and continue',
    icon: 'zap',
  },
  {
    title: 'Trusted Partners',
    description: 'Cards from leading issuers',
    icon: 'coins',
  },
  {
    title: 'Fast Continuity',
    description: 'Continue to the issuer in minutes',
    icon: 'calendar',
  },
];

const CreditCardForm = ({
  creditCardName,
  creditCardTitle,
  onClose,
  onSuccess,
  isModal = true,
}: CreditCardFormProps): React.ReactNode => {
  const {
    formValues,
    formErrors,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    isSubmitting,
    canSubmit,
  } = useCreditCardForm({
    creditCardName,
    onSuccess,
  });

  const onFormSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    void handleSubmit();
  };

  return (
    <LoanProductSplitLayout
      isModal={isModal}
      accent="blue"
      title="Credit Card"
      headline={`Apply for ${creditCardTitle}`}
      subheadline="Fill in a few details to continue to the issuer application."
      formTitle="Credit Card Application"
      hero={{
        src: IMAGES.ICONS.CREDIT_CARD,
        alt: creditCardTitle,
        width: 128,
        height: 128,
      }}
      features={CREDIT_CARD_FEATURES}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onBack={onClose}
      onSubmit={onFormSubmit}
    >
      <CreditCardFields
        formValues={formValues}
        formErrors={formErrors}
        handleFieldChange={handleFieldChange}
        handleFieldBlur={handleFieldBlur}
      />
    </LoanProductSplitLayout>
  );
};

export default CreditCardForm;
