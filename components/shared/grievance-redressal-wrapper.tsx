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
      <div className="mb-8 flex justify-center py-2">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <Image
            src={IMAGES.ILLUSTRATIONS.LOAN_PROCESS_FLOW}
            alt="WeCredit Loan Process Flow - Customer, Marketplace, Compare Lenders, Lender KYC and Underwriting, Loan Sanction, Disbursement"
            width={1024}
            height={1536}
            className="h-auto w-full rounded-xl object-contain shadow-sm border border-gray-100"
            priority
          />
        </div>
      </div>
    </FooterLinkPageWrapper>
  );
};

export default GrievanceRedressalWrapper;
