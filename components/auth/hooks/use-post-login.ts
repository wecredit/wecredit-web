import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { PendingAction } from '@/stores/auth-store';
import { submitBusinessLoanEnquiry } from '@/lib/api/business-loan-service';
import { submitCarLoanEnquiry } from '@/lib/api/car-loan-service';
import { submitHomeLoanEnquiry } from '@/lib/api/home-loan-service';
import { submitGoldLoanEnquiry } from '@/lib/api/gold-loan-service';
import { submitPrimeplLeadEnquiry } from '@/lib/api/primepl-lead-service';
import { pushPrimeplFormSubmission } from '@/lib/gtm';
import {
  BUSINESS_LOAN_SUBMIT_SUCCESS_EVENT,
  CAR_LOAN_SUBMIT_SUCCESS_EVENT,
  HOME_LOAN_SUBMIT_SUCCESS_EVENT,
  GOLD_LOAN_SUBMIT_SUCCESS_EVENT,
  PRIMEPL_LEAD_SUBMIT_SUCCESS_EVENT,
} from '@/lib/constants/events';
import { useLoanApplicationStore } from '@/stores/loan-application-store';
import { buildInternalLenderNavigationHref } from '@/lib/utils/internal-lender-navigation';
import { forwardLenderRedirectByPhone } from '@/lib/api/wecredit';
import { LNT_LENDER_NAME, STORAGE_AUTH_TOKEN, STORAGE_MOBILE } from '@/lib/constants/api-keys';
import { isLnt } from '@/lib/utils/common-helper';
import { getCookie } from 'cookies-next';

type SubmitFn<TPayload> = (payload: TPayload) => Promise<boolean>;

async function submitAndDispatch<TPayload>(
  payload: TPayload,
  submit: SubmitFn<TPayload>,
  eventName: string,
  logPrefix: string,
  apiLabel: string,
  onSuccess?: (payload: TPayload) => void
): Promise<void> {
  try {
    const success = await submit(payload);
    if (success) {
      onSuccess?.(payload);
      window.dispatchEvent(new CustomEvent(eventName));
    }
  } catch (err) {
    // Log and keep the user on the form; success is only signaled via the event.
  }
}

function submitLoanPayload<TPayload>(
  payload: TPayload | undefined,
  submit: SubmitFn<TPayload>,
  eventName: string,
  logPrefix: string,
  apiLabel: string,
  missingPayloadMessage: string,
  onSuccess?: (payload: TPayload) => void
): void {
  // Guard against incomplete pending actions (e.g., cleared state or bad payload).
  if (!payload) {
    console.warn(missingPayloadMessage);
    return;
  }

  void submitAndDispatch(payload, submit, eventName, logPrefix, apiLabel, onSuccess);
}

/**
 * Custom hook for handling post-login actions
 * Watches for successful login and executes pending actions
 * 
 * PDF Step 5A - Post Login Behaviour
 * After successful login, checks for pending action and executes it
 */
export const usePostLogin = (): void => {
  const router = useRouter();
  const { isAuthenticated, consumePendingAction } = useAuthStore();
  const wasAuthenticated = useRef(false);

  const executePendingAction = useCallback((action: PendingAction | null): void => {
    if (!action) {
      return;
    }


    switch (action.type) {
      case 'navigate_to_offer':
        if (action.href) {
          router.push(action.href);
        }
        break;

      case 'open_personal_loan_apply':
        // Home /personal-loan pages mount PersonalLoanContent which watches this flag.
        useLoanApplicationStore.getState().triggerApplyFlow();
        break;

      case 'check_eligibility':
        if (action.lenderName || action.lenderId) {
          if (isLnt(action.lenderId) || isLnt(action.lenderName)) {
            const mobile =
              (getCookie(STORAGE_MOBILE) as string | undefined) ||
              useAuthStore.getState().user?.phoneNumber;
            const token = getCookie(STORAGE_AUTH_TOKEN) as string | undefined;
            if (mobile) {
              void forwardLenderRedirectByPhone(mobile, LNT_LENDER_NAME, token);
              break;
            }
          }
          if (action.lenderName) {
            router.push(buildInternalLenderNavigationHref(action.lenderName));
          }
        }
        break;
      case 'submit_business_loan':
        submitLoanPayload(
          action.businessLoanPayload,
          submitBusinessLoanEnquiry,
          BUSINESS_LOAN_SUBMIT_SUCCESS_EVENT,
          '[BL]',
          'bl-leads',
          '[BL] usePostLogin: submit_business_loan but no businessLoanPayload'
        );
        break;
      case 'submit_car_loan':
        submitLoanPayload(
          action.carLoanPayload,
          submitCarLoanEnquiry,
          CAR_LOAN_SUBMIT_SUCCESS_EVENT,
          '[CL]',
          'car loan',
          '[CL] usePostLogin: submit_car_loan but no carLoanPayload'
        );
        break;
      case 'submit_home_loan':
        submitLoanPayload(
          action.homeLoanPayload,
          submitHomeLoanEnquiry,
          HOME_LOAN_SUBMIT_SUCCESS_EVENT,
          '[HL]',
          'home loan',
          '[HL] usePostLogin: submit_home_loan but no homeLoanPayload'
        );
        break;
      case 'submit_gold_loan':
        submitLoanPayload(
          action.goldLoanPayload,
          submitGoldLoanEnquiry,
          GOLD_LOAN_SUBMIT_SUCCESS_EVENT,
          '[GL]',
          'gold loan',
          '[GL] usePostLogin: submit_gold_loan but no goldLoanPayload'
        );
        break;
      case 'submit_primepl_lead':
        submitLoanPayload(
          action.primeplLeadPayload,
          submitPrimeplLeadEnquiry,
          PRIMEPL_LEAD_SUBMIT_SUCCESS_EVENT,
          '[Primepl]',
          'primepl lead',
          '[Primepl] usePostLogin: submit_primepl_lead but no primeplLeadPayload',
          (payload) => {
            pushPrimeplFormSubmission({
              status: 'success',
              declaredSalary: payload.netSalaryPm,
              empType: payload.occupation,
            });
          }
        );
        break;
      default:
        console.warn('[AuthModal] Unknown pending action type:', action.type);
    }
  }, [router]);

  /**
   * PDF Step 5A - Post Login Behaviour
   * Watch for successful login and execute pending action.
   * Must depend on isAuthenticated so the effect re-runs when login completes
   * (setUser closes the modal but this hook runs in layout; we need to react to auth change).
   */
  useEffect(() => {
    // Detect transition from not authenticated to authenticated
    if (isAuthenticated && !wasAuthenticated.current) {
      const action = consumePendingAction();
      executePendingAction(action);
    }

    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, consumePendingAction, executePendingAction]);
};
