'use client';

import type { ReactNode } from 'react';
import { IMAGES } from '@/lib/constants/images';
import { TERMS_OF_USE_NOTE } from '@/lib/constants/common';
import { FooterLinkPageWrapper } from './footer-link-page-wrapper';
import PageHeading from './page-heading';

type TermsOfUseWrapperProps = {
  htmlContent: string;
};

const TermsOfUseWrapper = ({ htmlContent }: TermsOfUseWrapperProps): ReactNode => {
  return (
    <FooterLinkPageWrapper
      banner={{
        title: 'Terms of Use',
        iconImage: IMAGES.ICONS.TERMS_OF_SERVICE,
      }}
      contentClassName='px-4'
    >
      <PageHeading className="sr-only">Terms of Service</PageHeading>
      <div
        className="wc-static-content max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </FooterLinkPageWrapper>
  );
};

export default TermsOfUseWrapper;
