'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GradientHeader } from '@/components/shared';
import { BottomSheet, PhoneInput } from '@/components/auth';
import { useAppHeight } from '@/hooks/use-app-height';
import { cn } from '@/lib/utils';
import type { HeaderHeightPreset, PhoneStepScreenProps } from '../types';

/**
 * Phone step screen component
 * Full screen with gradient header and bottom sheet (50-50 layout)
 * Handles phone number input and OTP request
 */
export const PhoneStepScreen = ({
  phoneNumber,
  isPhoneValid,
  isLoading,
  error,
  onPhoneChange,
  onContinue,
  onClose,
  headerHeight = 'sixtyFive',
  headerHeightPercent = 65,
  headerClassName,
  bottomSheetClassName,
  isDesktopModal = false,
}: PhoneStepScreenProps): React.ReactNode => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const bottomSheetClasses: string =
    bottomSheetClassName
    ?? 'flex-1 flex flex-col md:mt-0 md:rounded-none md:shadow-none md:[&>div:first-child]:hidden md:[&>div:last-child]:p-0';
  const containerStyle: React.CSSProperties = useAppHeight();
  const usesResponsiveModalHeight = isDesktopModal && headerHeightPercent === 65;
  const headerHeightStyle: React.CSSProperties | undefined = headerHeightPercent && !usesResponsiveModalHeight
    ? {
      height: `calc(var(--app-height, 1vh) * ${headerHeightPercent})`,
    }
    : undefined;
  const resolvedHeaderClassName = cn(
    usesResponsiveModalHeight && 'h-[65%] overflow-hidden md:h-0 md:min-h-0',
    headerClassName
  );
  const resolvedHeaderHeight: HeaderHeightPreset | undefined =
    headerHeightPercent ? undefined : headerHeight;

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isPhoneValid || !hasAcceptedTerms || isLoading) return;
    onContinue();
  };

  const canContinue = isPhoneValid && hasAcceptedTerms && !isLoading;

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
      transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 rounded-full p-2 transition-colors md:top-5 md:right-5 md:bg-gray-100 md:hover:bg-gray-200"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white md:text-gray-700" />
      </button>

      {/* Gradient Header with Illustration - 75% height */}
      <GradientHeader
        variant="logo-only"
        height={resolvedHeaderHeight}
        style={headerHeightStyle}
        className={resolvedHeaderClassName}
        isPhoneNumberHeader
      />


      {/* Bottom Sheet - fills remaining 50% */}
      <BottomSheet className={bottomSheetClasses}>
        <motion.form
          className="flex-1 flex flex-col md:mx-auto md:w-full md:max-w-none md:flex-none md:px-10 md:pt-14 md:pb-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleFormSubmit}
          noValidate
        >
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-medium mb-1">
              Account
            </h1>
            <p className="text-gray-500 text-sm">
              Login/Create your account
            </p>
          </div>

          {/* Phone Input Section */}
          <div>
            <label className="block text-xs font-semibold tracking-wider mb-2">
              PHONE NUMBER
            </label>
            <PhoneInput
              value={phoneNumber}
              onChange={onPhoneChange}
              placeholder=""
              error={error || undefined}
            />
          </div>

          {/* Terms & Conditions */}
          <div className="my-6 flex items-start gap-3">
            <input
              id="login-consent"
              type="checkbox"
              checked={hasAcceptedTerms}
              onChange={(event) => setHasAcceptedTerms(event.target.checked)}
              aria-describedby="login-consent-description"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-wc-blue-500 focus:ring-2 focus:ring-wc-blue-500"
            />
            <p
              id="login-consent-description"
              className="text-xs leading-5 text-gray-500 "
            >
              <span
                className="cursor-pointer"
                onClick={() => setHasAcceptedTerms((prev) => !prev)}
              >
                By clicking, I accept the{' '}
              </span>
              <Link
                href="/terms-of-service"
                className="text-gray-900 font-semibold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms & Conditions
              </Link>{' '}
              &{' '}
              <Link
                href="/privacy-policy"
                className="text-gray-900 font-semibold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-1 md:hidden" />

          {/* Continue Button */}
          <motion.button
            type="submit"
            disabled={!canContinue}
            className={cn(
              'w-full cursor-pointer rounded-full py-4 font-semibold text-base transition-all duration-300 md:py-3.5',
              canContinue
                ? 'bg-wc-blue-500 text-white shadow-lg shadow-wc-blue-500/30 hover:bg-wc-blue-600 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            whileTap={canContinue ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending OTP...
              </span>
            ) : (
              'Continue'
            )}
          </motion.button>
        </motion.form>
      </BottomSheet>
    </motion.div>
  );
};
