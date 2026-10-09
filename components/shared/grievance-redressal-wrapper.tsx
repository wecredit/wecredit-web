'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { IMAGES } from '@/lib/constants/images';
import GrievanceContactContent from './grievance-contact-content';
import { FooterLinkPageWrapper } from './footer-link-page-wrapper';
import PageHeading from './page-heading';

const GrievanceRedressalWrapper = (): ReactNode => {
  return (
    <FooterLinkPageWrapper
      banner={{
        title: 'Grievance Redressal',
        iconImage: IMAGES.ICONS.WECREDIT_HEART,
      }}
      contentClassName="px-4"
    >
      <PageHeading className="sr-only">WeCredit Grievance Redressal</PageHeading>
      <GrievanceContactContent />
    </FooterLinkPageWrapper>
  );
};

export default GrievanceRedressalWrapper;
