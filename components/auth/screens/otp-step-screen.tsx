'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Clock, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import OtpInput from 'react-otp-input';
import { OTPInput } from '@/components/auth';
import { GradientHeader } from '@/components/shared';
import { useAppHeight } from '@/hooks/use-app-height';
import { IMAGES } from '@/lib/constants/images';
import { cn } from '@/lib/utils';
import { sanitizeNumericInput } from '@/lib/utils/form-helpers';
import type { HeaderHeightPreset, OTPStepScreenProps } from '../types';

const RESEND_SECONDS = 30;

/**
 * OTP step screen component
 * Mobile keeps the original illustrated OTP screen; desktop modal uses the
 * simpler standalone OTP confirmation card layout.
 * Handles OTP verification
 */
export const OTPStepScreen = ({
  otpValue,
  isLoading,
  error,
  phoneNumber,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
  onClose,
  headerHeightPercent = 65,
  headerHeight = 'threeQuarter',
  isDesktopModal = false,
}: OTPStepScreenProps): React.ReactNode => {
  const isOtpComplete = otpValue.length === 6;
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const containerStyle: React.CSSProperties = useAppHeight();
  const usesResponsiveModalHeight = isDesktopModal && headerHeightPercent === 65;
  const headerHeightStyle: React.CSSProperties | undefined = headerHeightPercent && !usesResponsiveModalHeight
    ? {
      height: `calc(var(--app-height, 1vh) * ${headerHeightPercent})`,
    }
    : undefined;
  const headerClassName = usesResponsiveModalHeight
    ? 'h-[43%] min-[390px]:h-[46%] overflow-hidden md:h-[300px]'
    : undefined;
  const resolvedHeaderHeight: HeaderHeightPreset | undefined =
    headerHeightPercent ? undefined : headerHeight;

  const maskedPhone = useMemo(() => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (!digits) return 'your mobile number';
    const localNumber = digits.length > 10 ? digits.slice(-10) : digits;
    return `+91 ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`;
  }, [phoneNumber]);

  useEffect(() => {
    if (canResend) return;

    const timer = window.setInterval(() => {
      setResendTimer((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [canResend]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isOtpComplete || isLoading) return;
    // Pass otpValue explicitly — avoids stale state; no auto-verify on 6th digit
    // (that + Enter would double-submit and invalidate a one-time OTP).
    void onVerify(otpValue);
  };

  const handleOtpChange = (value: string): void => {
    onOtpChange(sanitizeNumericInput(value, 6));
  };

  const handleResend = (): void => {
    if (!canResend || isLoading) return;
    setResendTimer(RESEND_SECONDS);
    setCanResend(false);
    onResend();
  };

  return (
    <motion.div
      className={cn(
        'relative flex h-full min-h-0 flex-col',
        isDesktopModal && 'md:h-auto md:min-h-0'
      )}
      style={isDesktopModal ? undefined : containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
    >
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 z-20 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <GradientHeader
          variant="with-illustration"
          height={resolvedHeaderHeight}
          style={headerHeightStyle}
          className={headerClassName}
          illustration={IMAGES.ILLUSTRATIONS.OTP_SMS}
          illustrationAlt="OTP verification illustration"
        />

        <form
          className="relative z-10 -mt-3 flex min-h-0 flex-1 flex-col justify-between gap-4 rounded-t-3xl bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[clamp(2rem,7vh,5rem)]"
          onSubmit={handleFormSubmit}
          noValidate
        >
          <div>
            <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
              Enter your OTP
            </h1>

            <div className="mx-auto w-full">
              <OTPInput
                value={otpValue}
                onChange={handleOtpChange}
                onResend={onResend}
                onChangeNumber={onBack}
                error={error || undefined}
                disabled={isLoading}
                variant="default"
                showResend={true}
                phoneNumber={phoneNumber}
                className="[&>div:first-child]:mb-5 [&>div:first-child]:px-0 [&>div:last-child]:space-y-2"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={!isOtpComplete || isLoading}
            className={cn(
              'mx-auto block w-full max-w-sm rounded-md py-3.5 text-base font-semibold transition-all duration-300',
              isOtpComplete && !isLoading
                ? 'bg-wc-blue-500 text-white shadow-lg shadow-wc-blue-500/30 hover:bg-wc-blue-600 active:scale-[0.98]'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            )}
            whileTap={isOtpComplete && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying...
              </span>
            ) : (
              'Continue'
            )}
          </motion.button>
        </form>
      </div>

      <div className="hidden md:block">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 md:right-5 md:top-5"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <form
          className="relative z-10 flex w-full flex-1 flex-col justify-center  md:flex-none md:rounded-3xl md:px-14 md:py-14"
          onSubmit={handleFormSubmit}
          noValidate
        >
          <h1 className="text-2xl font-semibold text-[#20242b] md:text-3xl">Enter your OTP</h1>
          <p className="mt-4 text-sm text-gray-500 md:text-base">
            We&apos;ve sent a 6-digit code to {maskedPhone}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="mt-4 w-fit text-sm font-semibold text-brand-primary md:text-base"
          >
            Change Number
          </button>

          <div className="mt-7">
            <OtpInput
              value={otpValue}
              onChange={handleOtpChange}
              numInputs={6}
              inputType="tel"
              renderInput={(props) => {
                const restProps = { ...props, style: undefined };
                return (
                  <input
                    {...restProps}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={isLoading}
                    className={cn(
                      'h-12 w-12 border-b-2 bg-[#045CCF]/15 text-center text-xl font-semibold text-gray-900 outline-none disabled:opacity-60 sm:h-14 sm:w-14 md:h-16 md:w-16 md:text-2xl',
                      error ? 'border-red-400 bg-red-50' : 'border-brand-primary'
                    )}
                  />
                );
              }}
              shouldAutoFocus
              containerStyle={{
                display: 'flex',
                gap: 'clamp(0.45rem, 2vw, 0.75rem)',
                justifyContent: 'space-between',
                width: '100%',
              }}
            />
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}

          <div className="mt-7 space-y-4 text-sm text-gray-500 md:text-base">
            <p>
              Didn&apos;t receive the OTP?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className="font-semibold text-brand-primary disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Resend OTP
              </button>
            </p>

            <p className={canResend ? 'flex items-center gap-2 text-xs font-medium text-gray-400' : 'flex items-center gap-2 text-gray-500'}>
              {!canResend && <Clock className="h-4 w-4" />}
              {canResend
                ? 'Please check your SMS inbox and spam folder.'
                : `Resend in 00:${String(resendTimer).padStart(2, '0')}`}
            </p>
          </div>

          <div className="flex-1 md:hidden" />

          <motion.button
            type="submit"
            disabled={!isOtpComplete || isLoading}
            className={cn(
              'mt-9 cursor-pointer flex h-14 w-full items-center justify-center rounded-md text-base font-semibold transition-colors md:text-lg',
              isOtpComplete && !isLoading
                ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            whileTap={isOtpComplete && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              'Continue'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};
