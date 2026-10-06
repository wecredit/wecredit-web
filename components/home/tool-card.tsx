import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  href: string;
  imagePath?: string;
  fallbackIcon?: LucideIcon;
}

const ToolCard = ({
  id,
  title,
  description,
  href,
  imagePath,
  fallbackIcon: FallbackIcon,
}: ToolCardProps): React.ReactNode => {
  const displayTitle = title.replace('\n', ' ');

  if (id === 'credit-score-check') {
    let creditScoreImage: React.ReactNode = null;
    if (imagePath) {
      creditScoreImage = (
        <Image
          src={imagePath}
          alt="Credit score gauge showing a good score of 765"
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 144px, 128px"
        />
      );
    }

    return (
      <Link
        href={href}
        className="group relative order-first col-span-2 block overflow-hidden rounded-xl bg-gradient-to-br from-wc-blue-500 to-wc-accent p-3.5 text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 sm:p-4 lg:h-56 lg:p-5"
      >
        <div className="absolute -bottom-16 -left-12 size-40 rounded-full bg-white/10" />
        <div className="absolute -right-10 -top-20 size-48 rounded-full bg-white/10" />

        <div className="relative z-10 flex h-full flex-col items-start">
          <div className="flex items-center rounded-full border border-white/15 bg-white/20 px-2 sm:px-3 py-1 text-[10px] font-semibold tracking-wide sm:text-xs">
            <span className="mr-1.5 size-2 rounded-full bg-wc-green" />
            NEW • JUST LAUNCHED
          </div>
          <h3 className="mt-1 md:mt-2 max-w-[58%] text-xl font-semibold leading-tight lg:max-w-[55%]">
            Know your Credit Score
          </h3>
          <p className="mt-2 md:mt-1.5 max-w-[58%] text-xs leading-snug text-white/95 sm:text-sm lg:max-w-[56%]">
            Check your full credit report in seconds. <strong>Free &amp; Instant</strong> and it never impacts your score.
          </p>
          <span className="mt-2 md:mt-auto inline-flex h-9 min-w-44 items-center justify-center gap-3 rounded-lg bg-white px-5 text-sm font-semibold text-brand-primary sm:h-10 lg:min-w-38 lg:text-xs">
            Check Now
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>

        <div className="absolute right-3 top-4 z-10 flex items-center gap-1 text-[9px] text-white/90 sm:right-4 sm:text-[10px] lg:right-5">
          <Shield className="size-3 fill-white" aria-hidden="true" />
          Powered by EQUIFAX
        </div>
        <div className="absolute bottom-8 right-2 h-24 w-28 sm:right-4 sm:h-28 sm:w-32 lg:bottom-9 lg:right-5 lg:h-32 lg:w-36">
          {creditScoreImage}
        </div>
      </Link>
    );
  }

  let illustration: React.ReactNode;
  if (imagePath) {
    illustration = (
      <Image
        src={imagePath}
        alt=""
        fill
        className="object-contain object-bottom-right"
        sizes="(min-width: 1024px) 112px, 88px"
      />
    );
  } else if (FallbackIcon) {
    illustration = (
      <div className="flex h-full w-full items-end justify-end pb-1 pr-1">
        <FallbackIcon className="size-10 text-wc-blue-500" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group relative block h-[198px] overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 sm:p-5 lg:h-56"
    >
      <h3 className="max-w-[9rem] text-base font-medium leading-snug text-gray-900 lg:text-lg">
        {displayTitle}
      </h3>
      <p className="mt-2 max-w-[9rem] text-xs leading-snug text-gray-700 sm:text-sm lg:text-base">
        {description}
      </p>

      <div className="absolute bottom-1 right-1 size-[84px] sm:size-24 lg:bottom-2 lg:right-2 lg:size-28">
        {illustration}
      </div>
    </Link>
  );
};

export default ToolCard;
