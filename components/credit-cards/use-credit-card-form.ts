'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { submitCreditCardLead } from '@/lib/api/credit-card-service';
import { useLoadingStore } from '@/stores/loading-store';
import {
  DEFAULT_CREDIT_CARD_FORM_STATE,
  buildCreditCardLeadPayload,
  validateCreditCardForm,
  type CreditCardFormState,
} from './credit-card-form.config';
import type { CreditCardLeadPayload } from '@/types/credit-card';

interface UseCreditCardFormOptions {
  creditCardName: string;
  onSuccess?: () => void;
}

interface UseCreditCardFormReturn {
  formValues: CreditCardFormState;
  formErrors: Record<string, string>;
  handleFieldChange: (
    key: keyof CreditCardFormState,
    value: string | boolean
  ) => void;
  handleFieldBlur: (key: keyof CreditCardFormState) => void;
  handleSubmit: () => Promise<void>;
  getValidatedPayload: () => CreditCardLeadPayload | null;
  isSubmitting: boolean;
  canSubmit: boolean;
}

export const useCreditCardForm = (
  options: UseCreditCardFormOptions
): UseCreditCardFormReturn => {
  const { creditCardName, onSuccess } = options;
  const { isAuthenticated, user } = useAuth();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const [formValues, setFormValues] = useState<CreditCardFormState>(
    DEFAULT_CREDIT_CARD_FORM_STATE
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasPrefilledRef = useRef(false);
  const formValuesRef = useRef(formValues);
  formValuesRef.current = formValues;

  useEffect(() => {
    if (!isAuthenticated || !user?.phoneNumber || hasPrefilledRef.current) {
      return;
    }
    hasPrefilledRef.current = true;
    setFormValues((prev) => ({
      ...prev,
      mobile: user.phoneNumber.replace(/\D/g, '').slice(0, 10),
    }));
  }, [isAuthenticated, user?.phoneNumber]);

  const handleFieldChange = useCallback(
    (key: keyof CreditCardFormState, value: string | boolean): void => {
      setFormValues((prev) => ({ ...prev, [key]: value }));
      setFormErrors((prev) => {
        if (!prev[key]) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const scrollToFirstError = useCallback((): void => {
    const firstErrorElement = document.querySelector(
      '.border-red-300, input:invalid'
    );
    if (!firstErrorElement) {
      return;
    }
    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors = validateCreditCardForm(formValues);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formValues]);

  const getValidatedPayload = useCallback((): CreditCardLeadPayload | null => {
    if (!validateForm()) {
      scrollToFirstError();
      return null;
    }
    return buildCreditCardLeadPayload(formValues, creditCardName);
  }, [creditCardName, formValues, scrollToFirstError, validateForm]);

  const handleFieldBlur = useCallback((key: keyof CreditCardFormState): void => {
    const errors = validateCreditCardForm(formValuesRef.current);
    const message = errors[key];
    setFormErrors((prev) => {
      if (message) {
        return { ...prev, [key]: message };
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }
    const payload = getValidatedPayload();
    if (!payload) {
      return;
    }
    setIsSubmitting(true);
    showLoading({
      message: 'Submitting your credit card application...',
      subtext: 'This will only take a moment.',
    });
    try {
      const success = await submitCreditCardLead(payload);
      if (success) {
        onSuccess?.();
        setFormValues(DEFAULT_CREDIT_CARD_FORM_STATE);
        setFormErrors({});
      }
    } finally {
      hideLoading();
      setIsSubmitting(false);
    }
  }, [
    getValidatedPayload,
    hideLoading,
    isSubmitting,
    onSuccess,
    showLoading,
  ]);

  const canSubmit = useMemo((): boolean => {
    return formValues.consent && !isSubmitting;
  }, [formValues.consent, isSubmitting]);

  return {
    formValues,
    formErrors,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    getValidatedPayload,
    isSubmitting,
    canSubmit,
  };
};
