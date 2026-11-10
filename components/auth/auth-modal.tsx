'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useAuthHandlers } from './hooks/use-auth-handlers';
import { usePostLogin } from './hooks/use-post-login';
import { PhoneStepScreen } from './screens/phone-step-screen';
import { OTPStepScreen } from './screens/otp-step-screen';
import { cn } from '@/lib/utils';

/**
 * Auth Modal component
 * Renders a full-screen modal with phone input and OTP verification steps
 * 
 * Post-Login Behaviour (PDF Step 5A):
 * After successful login, checks for pending action and executes it
 */
const AuthModal = (): React.ReactNode => {
  const { isModalOpen, currentStep, closeModal, setStep, setError } = useAuthStore();
  const pathname: string = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  useBodyScrollLock(isModalOpen);

  // Use custom hooks for business logic
  const {
    phoneNumber,
    otpValue,
    isPhoneValid,
    isLoading,
    error,
    handlePhoneChange,
    handleSendOtp,
    handleOtpChange,
    handleVerifyOtp,
    handleResendOtp,
    setOtpValue,
  } = useAuthHandlers();

  // Handle post-login actions
  usePostLogin();

  /** Handle back button click */
  const handleBack = (): void => {
    if (currentStep === 'otp') {
      setStep('phone');
      setError(null);
      setOtpValue('');
    }
  };

  /** Handle close */
  const handleClose = useCallback((): void => {
    closeModal();
    setOtpValue('');
  }, [closeModal, setOtpValue]);

  /** Handle backdrop click */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect((): void => {
    if (!isModalOpen) {
      previousPathnameRef.current = pathname;
      return;
    }
    if (previousPathnameRef.current && previousPathnameRef.current !== pathname) {
      handleClose();
    }
    previousPathnameRef.current = pathname;
  }, [handleClose, isModalOpen, pathname]);
  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex flex-col overscroll-y-none md:items-center md:justify-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container - handles slide-up entrance */}
          <motion.div
            className={cn(
              'relative flex h-full min-h-0 flex-col overflow-hidden overscroll-y-none md:max-w-[calc(100vw-2rem)] md:rounded-3xl md:shadow-2xl',
              currentStep === 'phone'
                ? 'md:h-auto md:w-[480px]'
                : 'md:h-auto md:w-[600px] md:overflow-visible'
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 300,
            }}
          >
            {currentStep === 'phone' ? (
              <PhoneStepScreen
                phoneNumber={phoneNumber}
                isPhoneValid={isPhoneValid}
                isLoading={isLoading}
                error={error}
                onPhoneChange={handlePhoneChange}
                onContinue={handleSendOtp}
                onClose={handleClose}
                isDesktopModal
              />
            ) : (
              <OTPStepScreen
                phoneNumber={phoneNumber}
                otpValue={otpValue}
                isLoading={isLoading}
                error={error}
                onOtpChange={handleOtpChange}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onBack={handleBack}
                onClose={handleClose}
                isDesktopModal
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
