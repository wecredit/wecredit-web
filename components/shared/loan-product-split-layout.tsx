'use client';

import { useCallback, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import ActionButton from './action-button';
import LoanBannerPerspectiveGrid from './loan-banner-perspective-grid';
import LoanFeatureHighlights from './loan-feature-highlights';
import type { LoanProductSplitLayoutProps } from './loan-product-split-layout.types';
import { LOAN_PRODUCT_PAGE_NOTE } from '@/lib/constants/common';

const DEFAULT_HERO_FRAME_CLASS_NAME =
  'relative z-10 mt-5 flex h-56 w-full items-center justify-center sm:h-72 md:mt-10 md:h-80';
const LARGE_HERO_FRAME_CLASS_NAME =
  'relative z-10 mt-5 flex h-48 w-full items-center justify-center sm:h-60 md:mt-8 md:h-72';
const DEFAULT_HERO_IMAGE_CLASS_NAME =
  'mx-auto h-auto w-full max-h-56 max-w-[280px] object-contain drop-shadow-xl sm:max-h-72 sm:max-w-[360px] md:max-h-80 md:max-w-[420px]';
const LARGE_HERO_IMAGE_CLASS_NAME =
  'mx-auto h-full w-full max-h-full max-w-full object-contain drop-shadow-xl';

function renderBannerBackdrop(
  bannerPattern?: 'perspective',
  bannerPatternSrc?: string
): React.ReactNode {
  if (bannerPattern === 'perspective') {
    return <LoanBannerPerspectiveGrid />;
  }
  if (bannerPatternSrc) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={bannerPatternSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white via-white/70 to-transparent" />
      </div>
    );
  }
  return null;
}

/**
 * Shared split layout for car, home, and gold loan enquiry pages.
 */
const LoanProductSplitLayout = ({
  isModal = false,
  accent = 'blue',
  title,
  headline,
  subheadline,
  formTitle,
  hero,
  bannerPattern,
  bannerPatternSrc,
  features,
  canSubmit,
  isSubmitting,
  onBack,
  onSubmit,
  children,
}: LoanProductSplitLayoutProps): React.ReactNode => {
  const isGold = accent === 'gold';
  const bannerSectionRef = useRef<HTMLElement>(null);
  const [mobileHeaderOpacity, setMobileHeaderOpacity] = useState(0);
  const rootClassName = isModal
    ? 'flex h-full min-h-0 w-full flex-1 flex-col bg-white'
    : 'flex h-dvh w-full flex-col bg-white';
  const isMobileHeaderTextDark = isGold || mobileHeaderOpacity >= 0.5;

  const handleFormScroll = useCallback((event: React.UIEvent<HTMLFormElement>): void => {
    const bannerHeight = bannerSectionRef.current?.offsetHeight ?? 0;
    const fadeDistance = Math.max(bannerHeight - 56, 1);
    const opacity = Math.min(event.currentTarget.scrollTop / fadeDistance, 1);
    setMobileHeaderOpacity(opacity);
  }, []);

  return (
    <div className={rootClassName}>
      <form
        onSubmit={onSubmit}
        onScroll={handleFormScroll}
        className="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto md:grid md:h-full md:grid-cols-[40%_60%] md:overflow-hidden"
      >
        <div
          className={cn(
            'sticky top-0 z-30 -mb-14 flex h-14 w-full shrink-0 items-center justify-center px-4 transition-colors md:hidden',
            isMobileHeaderTextDark ? 'text-gray-900' : 'text-white'
          )}
        >
          <div
            className="absolute inset-0 bg-white"
            style={{ opacity: mobileHeaderOpacity }}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'absolute left-4 z-10 rounded-full p-1 transition-colors',
              isMobileHeaderTextDark ? 'hover:bg-black/5' : 'hover:bg-white/10'
            )}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="relative z-10 min-w-0 text-lg font-semibold">{title}</h1>
        </div>

        <section
          ref={bannerSectionRef}
          className={cn(
            'relative flex w-full shrink-0 flex-col overflow-hidden px-4 pb-4 pt-3 sm:px-6 md:h-full md:px-8 md:pb-6 md:pt-6 lg:px-10',
            isGold
              ? 'bg-gradient-to-b from-yellow-400 via-amber-300 to-amber-50 text-gray-900'
              : 'bg-gradient-to-b from-blue-700 via-blue-100 to-white text-white'
          )}
        >
          {renderBannerBackdrop(bannerPattern, bannerPatternSrc)}
          <div className="relative z-10 hidden w-full min-w-0 items-center md:flex md:justify-start md:gap-3">
            <button
              type="button"
              onClick={onBack}
              className={cn(
                'absolute left-0 shrink-0 rounded-full p-1 transition-colors md:static md:-ml-1',
                isGold
                  ? 'text-gray-900 hover:bg-black/5'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="min-w-0 text-lg font-semibold md:text-xl">{title}</h1>
          </div>
          <div
            className={
              hero.size === 'large' ? LARGE_HERO_FRAME_CLASS_NAME : DEFAULT_HERO_FRAME_CLASS_NAME
            }
          >
            <img
              src={hero.src}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              decoding="async"
              fetchPriority="high"
              className={cn(
                hero.size === 'large' ? LARGE_HERO_IMAGE_CLASS_NAME : DEFAULT_HERO_IMAGE_CLASS_NAME,
                hero.className
              )}
            />
          </div>
          <div className="relative z-10 mt-5 hidden w-full text-gray-950 md:mt-8 md:block">
            <h2 className="w-full max-w-md text-xl font-semibold leading-snug md:text-2xl md:leading-tight">
              {headline}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-700 md:mt-2">
              {LOAN_PRODUCT_PAGE_NOTE}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-700 md:mt-2">
              {subheadline}
            </p>
          </div>
          <div className="relative z-10 mt-4 md:mt-5">
            <LoanFeatureHighlights features={features} accent={accent} />
          </div>
        </section>
        <section className="flex min-w-0 w-full flex-col bg-white md:h-full md:min-h-0">
          <div className="px-4 pb-6 pt-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:px-12 md:py-6">
            <div className="w-full">
              <h2 className="mb-4 text-base font-medium text-gray-900 md:mb-5">{formTitle}</h2>
              <div className="space-y-4 md:space-y-5">{children}</div>
              <div className="sticky bottom-0 z-20 -mx-4 mt-6 bg-white px-4 pb-4 pt-3 shadow-[0_-8px_16px_rgba(255,255,255,0.95)] md:-mx-12 md:px-12 md:pb-0">
                <ActionButton
                  type="submit"
                  disabled={!canSubmit}
                  isLoading={isSubmitting}
                  fullWidth
                  className="h-12 rounded-lg text-base"
                >
                  Submit
                </ActionButton>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default LoanProductSplitLayout;
