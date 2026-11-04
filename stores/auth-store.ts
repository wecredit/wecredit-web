import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getCookie } from 'cookies-next';
import type { BusinessLoanEnquiryPayload } from '@/lib/api/business-loan-service';
import type { CarLoanEnquiryPayload } from '@/components/car-loan/car-loan-form.config';
import type { HomeLoanEnquiryPayload } from '@/components/home-loan/home-loan-form.config';
import type { GoldLoanEnquiryPayload } from '@/components/gold-loan/gold-loan-form.config';
import type { PrimeplLeadEnquiryPayload } from '@/components/primepl-lead/primepl-lead-form.config';
import { STORAGE_AUTH_TOKEN, STORAGE_MOBILE } from '@/lib/constants/api-keys';
import { useOfferStore } from './offer-store';
import { useUrlParamsStore } from './url-params-store';

/**
 * User data interface
 */
interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
}

/**
 * Auth modal step type
 */
type AuthStep = 'phone' | 'otp';

/**
 * Pending action types for post-login continuation
 * Per PDF Step 5A - Post Login Behaviour: Continue with intended action after login
 */
type PendingActionType =
  | 'navigate_to_offer'
  | 'check_eligibility'
  /** After OTP on home/personal-loan, run the same apply flow as the CTA (dedupe → lead form). */
  | 'open_personal_loan_apply'
  | 'submit_business_loan'
  | 'submit_car_loan'
  | 'submit_home_loan'
  | 'submit_gold_loan'
  | 'submit_primepl_lead';

/**
 * Pending action data structure
 * Stores the action user intended to perform before being prompted to login
 */
interface PendingAction {
  /** Type of action to perform after login */
  type: PendingActionType;
  /** Lender ID for the action (navigate_to_offer / check_eligibility) */
  lenderId?: string;
  /** Lender name for display/logging (navigate_to_offer / check_eligibility) */
  lenderName?: string;
  /** Target URL to navigate to (navigate_to_offer / check_eligibility) */
  href?: string;
  /** Form payload for submit_business_loan - used after OTP to call bl-leads API */
  businessLoanPayload?: BusinessLoanEnquiryPayload;
  /** Form payload for submit_car_loan - used after OTP to call car loan API */
  carLoanPayload?: CarLoanEnquiryPayload;
  /** Form payload for submit_home_loan - used after OTP to call home loan API */
  homeLoanPayload?: HomeLoanEnquiryPayload;
  /** Form payload for submit_gold_loan - used after OTP to call gold loan API */
  goldLoanPayload?: GoldLoanEnquiryPayload;
  /** Form payload for submit_primepl_lead - used after OTP to call Primepl lead API */
  primeplLeadPayload?: PrimeplLeadEnquiryPayload;
}

/**
 * Auth store state interface
 */
interface AuthState {
  /** Whether the auth modal is open */
  isModalOpen: boolean;
  /** Current step in the auth flow */
  currentStep: AuthStep;
  /** Phone number being authenticated */
  phoneNumber: string;
  /** Whether auth state has been initialized */
  isAuthInitialized: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user data */
  user: User | null;
  /** Auth token */
  token: string | null;
  /** Loading state for API calls */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Pending action to execute after successful login (PDF Step 5A) */
  pendingAction: PendingAction | null;
  /**
   * When true, AuthModal opened on OTP step with a known phone (e.g. Upswing URL);
   * useAuthHandlers sends OTP once then clears this flag.
   */
  shouldAutoSendOtp: boolean;
}

/**
 * Auth store actions interface
 */
interface AuthActions {
  /** Open the auth modal */
  openModal: () => void;
  /** Open auth modal with a pending action to execute after login */
  openModalWithPendingAction: (action: PendingAction) => void;
  /**
   * Open modal on OTP step with phone pre-filled (e.g. Upswing ?mobile=...).
   * Triggers a one-time sendOtp via shouldAutoSendOtp in useAuthHandlers.
   */
  openModalWithPendingActionAtOtp: (action: PendingAction, phoneNumber: string) => void;
  /** Cleared after auto-send starts so Strict Mode does not double-send */
  clearShouldAutoSendOtp: () => void;
  /** Close the auth modal and reset state */
  closeModal: () => void;
  /** Set current auth step */
  setStep: (step: AuthStep) => void;
  /** Set phone number */
  setPhoneNumber: (phoneNumber: string) => void;
  /** Set authenticated user */
  setUser: (user: User, token: string) => void;
  /** Clear auth and logout */
  logout: () => void;
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  /** Set error message */
  setError: (error: string | null) => void;
  /** Reset modal state (but keep auth state) */
  resetModalState: () => void;
  /** Mark auth as initialized */
  setAuthInitialized: (isAuthInitialized: boolean) => void;
  /** Set pending action */
  setPendingAction: (action: PendingAction | null) => void;
  /** Clear pending action after execution */
  clearPendingAction: () => void;
  /** Get and clear pending action (for consumption after login) */
  consumePendingAction: () => PendingAction | null;
  /**
   * Sync auth state with cookies - ensures localStorage and cookies stay aligned.
   * If cookies are missing but localStorage says authenticated, forces logout.
   * Called on app mount and when tab becomes visible.
   * @returns true if state was in sync or corrected, false if logout was triggered
   */
  syncWithCookies: () => boolean;
}

/** Initial modal state */
const initialModalState = {
  isModalOpen: false,
  currentStep: 'phone' as AuthStep,
  phoneNumber: '',
  isLoading: false,
  error: null,
  pendingAction: null as PendingAction | null,
  shouldAutoSendOtp: false,
};

/** Initial auth state */
const initialAuthState = {
  isAuthInitialized: false,
  isAuthenticated: false,
  user: null,
  token: null,
};

/**
 * Zustand store for authentication state
 * Persists auth data (user, token) to localStorage
 * Supports pending actions for post-login continuation (PDF Step 5A)
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialModalState,
        ...initialAuthState,

        openModal: () =>
          set({ isModalOpen: true, error: null, shouldAutoSendOtp: false }),

        /** Open modal with pending action - used when user clicks offer without being logged in */
        openModalWithPendingAction: (action: PendingAction) =>
          set({
            isModalOpen: true,
            error: null,
            pendingAction: action,
            currentStep: 'phone',
            phoneNumber: '',
            shouldAutoSendOtp: false,
          }),

        openModalWithPendingActionAtOtp: (action: PendingAction, phoneNumber: string) =>
          set({
            isModalOpen: true,
            error: null,
            pendingAction: action,
            phoneNumber: phoneNumber.trim(),
            currentStep: 'otp',
            shouldAutoSendOtp: true,
          }),

        clearShouldAutoSendOtp: () => set({ shouldAutoSendOtp: false }),

        closeModal: () =>
          set({
            ...initialModalState,
          }),

        setStep: (step: AuthStep) => set({ currentStep: step, error: null }),

        setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),

        /** Set user - keeps pendingAction for post-login handling */
        setUser: (user: User, token: string) =>
          set({
            isAuthenticated: true,
            user,
            token,
            isModalOpen: false,
            currentStep: 'phone',
            phoneNumber: '',
            isLoading: false,
            error: null,
            shouldAutoSendOtp: false,
            // Note: pendingAction is NOT cleared here - it's consumed by the component
          }),

        logout: () => {
          // Reset offer store to prevent old user data from persisting
          useOfferStore.getState().reset();
          // Clear URL params to prevent reuse across sessions
          useUrlParamsStore.getState().clearParams();
          
          set({
            ...initialAuthState,
            ...initialModalState,
          });
        },

        setLoading: (isLoading: boolean) => set({ isLoading }),

        setError: (error: string | null) => set({ error, isLoading: false }),

        resetModalState: () => set(initialModalState),
        setAuthInitialized: (isAuthInitialized: boolean) => set({ isAuthInitialized }),
        setPendingAction: (action: PendingAction | null) =>
          set({ pendingAction: action }),

        clearPendingAction: () => set({ pendingAction: null }),

        /** Get and clear pending action atomically - for post-login consumption */
        consumePendingAction: () => {
          const action = get().pendingAction;
          if (action) {
            set({ pendingAction: null });
          }
          return action;
        },

        /**
         * Sync auth state with cookies.
         * Cookies are the source of truth - if they're missing, clear localStorage state.
         */
        syncWithCookies: () => {
          const token = getCookie(STORAGE_AUTH_TOKEN);
          const mobile = getCookie(STORAGE_MOBILE);
          const { isAuthenticated, user } = get();

          const hasCookies = !!(token && mobile);

          if (isAuthenticated && !hasCookies) {
            // Mismatch: localStorage says authenticated but cookies are gone
            // Force logout to clear stale localStorage state
            useOfferStore.getState().reset();
            useUrlParamsStore.getState().clearParams();
            // Keep isAuthInitialized true: AuthProvider only runs initializeAuth once on mount;
            // resetting it here would strand the app in "never initialized" after tab sync.
            set({
              ...initialAuthState,
              ...initialModalState,
              isAuthInitialized: true,
            });
            return false;
          }

          if (!isAuthenticated && hasCookies && !user) {
            // Cookies exist but state not hydrated yet - this is normal on first load
            // AuthProvider will handle setting user after validation
            return true;
          }

          return true;
        },
      }),
      {
        name: 'auth-storage',
        // Only persist user data for display; isAuthenticated is derived from cookies at runtime.
        // This ensures localStorage and cookies stay in sync - cookies are the source of truth.
        // pendingAction is NOT persisted - it's session-only
        partialize: (state) => ({
          user: state.user,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) {
            state?.setAuthInitialized(true);
            return;
          }
          // After rehydrating from localStorage, sync with cookies to ensure consistency.
          // If cookies are present, derive isAuthenticated from them.
          const token = getCookie(STORAGE_AUTH_TOKEN);
          const mobile = getCookie(STORAGE_MOBILE);
          const hasCookies = !!(token && mobile);

          if (hasCookies && state.user) {
            // Cookies exist and we have user data - mark as authenticated
            state.setUser(state.user, token?.toString() ?? '');
          } else if (!hasCookies && state.user) {
            // No cookies but user data exists - clear stale state
            state.logout();
          }
          state.setAuthInitialized(true);
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

export type { User, AuthStep, PendingAction, PendingActionType };
