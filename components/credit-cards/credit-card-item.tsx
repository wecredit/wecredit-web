'use client';

/**
 * Single credit card offer card with gradient background, image, benefits, and Apply CTA.
 * Renders external application link in a new tab.
 */

import type { CreditCard } from '@/types/credit-card';
import { useCreditCardTracking } from '@/hooks/use-credit-card-tracking';
import ActionButton from '../shared/action-button';

export interface CreditCardItemProps {
  card: CreditCard;
  /** Optional badge text (e.g. "Popular", "Top Choices") */
  badge?: string;
}

const CreditCardItem = ({ card, badge }: CreditCardItemProps): React.ReactNode => {
  const { trackCreditCardClick } = useCreditCardTracking();

  const handleApplyNow = (): void => {
    // Open URL first so user is never blocked
    window.open(card.link, '_blank');
    // Fire-and-forget: track click for logged-in users only
    trackCreditCardClick(card.title);
  };

  const gradientStyle = {
    background:
      card.gradientColors.length > 0
        ? `linear-gradient(to bottom, ${card.gradientColors.join(', ')})`
        : undefined,
  };

  const imageRadius = card.clip ? 'rounded-lg' : 'rounded-none';

  return (
    <article
      className="w-full relative bg-white rounded-xl shadow overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
      data-card-title={card.title}
    >
      {/* Image area with gradient behind */}
      <div
        className="relative w-full h-48 shrink-0 overflow-hidden bg-zinc-700"
        style={gradientStyle}
      >
        <img
          src={card.imageAsset}
          alt={card.title}
          className={`absolute inset-0 w-full h-full object-fill ${imageRadius}`}
          loading="lazy"
        />
      </div>


      {/* Content area */}
      <div className="flex-1 flex flex-col p-2.5 min-h-0">
        {/* Title row with optional badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-neutral-900 text-[18px] leading-[22px] font-medium  text-left flex-1 min-w-0">
            {card.title}
          </h2>
          {badge ? (
            <span className="shrink-0 px-2.5 py-1.5 bg-blue-500/20 rounded-3xl inline-flex items-center justify-center w-30">
              <span className="text-blue-500 text-xs font-medium font-sans leading-4">
                {badge}
              </span>
            </span>
          ) : null}
        </div>

        {/* Intro */}
        <p className="text-zinc-500 text-xs font-normal font-sans leading-4 my-2 line-clamp-2">
          {card.intro}
        </p>

        {/* Rewards section */}
        <div className="mb-2">
          <h3 className="text-neutral-900 text-sm font-medium font-sans leading-5 mb-1">
            Rewards :
          </h3>
          <ul className="space-y-0.5">
            {card.benefits.map((benefit, idx) => (
              <li
                key={idx}
                className="text-zinc-500 text-xs font-normal font-sans leading-4"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer: fee + Apply button */}
      <div className="border-t border-gray-200 p-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="w-full">
          <p className="text-brand-primary text-base font-semibold font-sans leading-6 text-center">
            {card.amount}
          </p>
          <p className="text-zinc-500 text-xs font-normal font-sans leading-4 text-center">
            {card.feeDetails}
          </p>
        </div>

        <ActionButton
          type="button"
          onClick={handleApplyNow}
          className="text-xs font-medium rounded-lg py-1 w-30"
        >
          Apply Now
        </ActionButton>
      </div>
    </article>
  );
};

export default CreditCardItem;
