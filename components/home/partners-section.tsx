"use client";

import React from 'react';
import { Partner } from '@/types/wecredit';
import { OUR_PARTNER_DISCLAIMER, PARTNERS } from '@/lib/constants/common';
import PartnerCard from './partner-card';
import { motion } from 'framer-motion';

function MarqueeRow({
  partners,
  direction,
}: {
  partners: Partner[];
  direction: 'left' | 'right';
}): React.ReactNode {
  const animationClass =
    direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse';

  return (
    <div className="marquee-container overflow-hidden">
      {/*
        Two equal tracks with matching trailing gap (pr-6 = gap-6).
        This makes translateX(-50%) land exactly on the duplicate, so the loop
        stays seamless instead of flinching when flex gap is on a single row.
      */}
      <div className={`flex w-max will-change-transform ${animationClass}`}>
        <div className="flex shrink-0 gap-6 pr-6">
          {partners.map((partner) => (
            <div key={`a-${partner.name}`} className="w-28 shrink-0 sm:w-32 lg:w-36">
              <PartnerCard partner={partner} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
          {partners.map((partner) => (
            <div key={`b-${partner.name}`} className="w-28 shrink-0 sm:w-32 lg:w-36">
              <PartnerCard partner={partner} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PartnersSection = (): React.ReactNode => {
  const rowSize = Math.ceil(PARTNERS.length / 3);
  const row1Partners: Partner[] = PARTNERS.slice(0, rowSize);
  const row2Partners: Partner[] = PARTNERS.slice(rowSize, rowSize * 2);
  const row3Partners: Partner[] = PARTNERS.slice(rowSize * 2);

  return (
    <section className="bg-white wc-section-gap overflow-hidden">
      <motion.h2
        className="wc-section-heading !mb-4 text-gray-900"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        Our Partners
      </motion.h2>
      <p className="text-center font-normal text-xs leading-5 tracking-normal text-zinc-500 mb-4 lg:text-sm lg:leading-6">
        {OUR_PARTNER_DISCLAIMER}
      </p>
      <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 md:px-4 lg:px-0">
        <MarqueeRow partners={row1Partners} direction="left" />
        <MarqueeRow partners={row2Partners} direction="right" />
        <MarqueeRow partners={row3Partners} direction="left" />
      </div>
    </section>
  );
};

export default PartnersSection;
