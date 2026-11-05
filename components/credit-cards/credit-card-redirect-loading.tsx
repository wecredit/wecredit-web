'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { PollingLoader } from '@/components/offers/polling-loader';
import { CREDIT_CARD_REDIRECT_COPY } from '@/lib/constants/credit-card-redirect';
import { IMAGES } from '@/lib/constants/images';
import type { CreditCardRedirectLoadingProps } from '@/components/credit-cards/credit-card-redirect-loading.types';

export const CreditCardRedirectLoading = ({
  partnerName,
  partnerImageUrl,
}: CreditCardRedirectLoadingProps): ReactNode => {
  const { LOADING_TITLE, LOADING_SUBTITLE_PREFIX } = CREDIT_CARD_REDIRECT_COPY;
  const { WECREDIT_LOGO, PROGRESS } = IMAGES.CREDIT_CARD_REDIRECT;
  const partnerLogo = partnerImageUrl?.trim() || IMAGES.ICONS.CREDIT_CARD_OFFER;
  const loadingSubtitle = `${LOADING_SUBTITLE_PREFIX} ${partnerName}.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white px-4"
      role="status"
      aria-live="polite"
      aria-label={LOADING_TITLE}
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <PollingLoader className="mb-8" />

        <h2 className="mb-3 text-lg font-semibold text-gray-900">{LOADING_TITLE}</h2>
        <p className="mb-14 text-sm font-medium text-gray-500">{loadingSubtitle}</p>

        <div className="flex items-center justify-center gap-3">
          <div className="flex h-[75px] w-[75px] md:h-[90px] md:w-[90px] shrink-0 items-center justify-center overflow-hidden">
            <Image
              src={WECREDIT_LOGO}
              alt="WeCredit"
              width={75}
              height={75}
              className="object-contain"
              loading="lazy"
            />
          </div>

          <Image
            src={PROGRESS}
            alt=""
            width={144}
            height={24}
            className="h-6 w-36 md:h-8 md:w-60 shrink-0"
            aria-hidden
          />

          <div className="flex h-[75px] w-[75px] md:h-[90px] md:w-[90px] shrink-0 items-center justify-center overflow-hidden">
            {/* Partner logos come from lender APIs on varying hosts — plain img avoids next/image domain allowlist misses. */}
            <img
              src={partnerLogo}
              alt={partnerName}
              width={75}
              height={75}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
