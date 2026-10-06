import React from 'react';
import Image from 'next/image';
import { MEDIA_OUTLETS } from '@/lib/constants/media';
import type { MediaLogoProps } from './media-section.types';

const MediaLogo = ({ outlet }: MediaLogoProps): React.ReactNode => (
  <a
    href={outlet.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Read WeCredit coverage on ${outlet.name}`}
    className={`flex h-16 w-full items-center justify-center justify-self-center rounded-lg transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${outlet.layoutClassName}`}
  >
    <span className={`block scale-125 ${outlet.containerClassName}`}>
      <Image
        src={outlet.image}
        alt={outlet.name}
        width={600}
        height={600}
        className={outlet.imageClassName}
      />
    </span>
  </a>
);

const MediaSection = (): React.ReactNode => {
  return (
    <section className="bg-white wc-section-gap" aria-labelledby="media-section-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="media-section-heading" className="wc-section-heading text-gray-900">
          WeCredit in the Media
        </h2>

        <div className="mx-auto mt-8 grid grid-cols-2 place-items-center gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-6 lg:grid-cols-4 lg:gap-8">
          {MEDIA_OUTLETS.map((outlet) => (
            <MediaLogo key={outlet.name} outlet={outlet} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaSection;
