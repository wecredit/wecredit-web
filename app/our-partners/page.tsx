import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/build-page-metadata';
import PartnerCard from '@/components/shared/partner-card';
import { FooterLinkPageWrapper } from '@/components/shared/footer-link-page-wrapper';
import type { PartnerDetail } from '@/lib/constants/partners-data';
import { OUR_PARTNER_DISCLAIMER } from '@/lib/constants/common';

/** Force static generation with 30-minute revalidation */
export const dynamic = 'force-static';
export const revalidate = 1800; // 30 minutes

const PARTNERS_URL =
  'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/our_partner_details_one.json';

export const metadata: Metadata = buildPageMetadata('/our-partners/');

/**
 * Fetch partner data from S3
 */
async function getPartners(): Promise<PartnerDetail[]> {
  const res = await fetch(PARTNERS_URL, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch partners data');
  }

  const json = await res.json();

  // Extract array safely
  const rawPartners = Array.isArray(json?.data) ? json.data : [];

  // Transform API shape → UI shape
  return rawPartners.map((item: Record<string, unknown>) => ({
    id: (item.partner_name as string)?.toLowerCase().replace(/\s+/g, '-'),
    logo: item.img_url as string,
    companyName:
      (item.info as Record<string, string>)?.companyName ||
      (item.partner_name as string),
    phone: (item.info as Record<string, string>)?.telephone || '',
    officer: (item.info as Record<string, string>)?.grievanceRedressalOfficer || '',
    email: (item.info as Record<string, string>)?.email || '',
    websiteLink:
      (item.info as Record<string, string>)?.redirectionLink ||
      (item.link as string) ||
      '',
  }));
}

/**
 * Our Partners page component
 */
const OurPartnersPage = async (): Promise<React.ReactNode> => {
  const partners = await getPartners();

  return (
    <FooterLinkPageWrapper
      pageHeaderTitle="WeCredit Lending Partners"
      className="min-h-screen bg-white"
      contentClassName="max-w-2xl lg:max-w-7xl mx-auto px-4 md:pt-4"
    >
      <h2 className="font-normal text-base leading-7 tracking-normal text-zinc-800 lg:text-xl lg:leading-8">
        Personal Loans Partners
      </h2>

      <p className="font-normal text-xs leading-5 tracking-normal text-zinc-500 mb-4 mt-1 lg:text-sm lg:leading-6">
        {OUR_PARTNER_DISCLAIMER}
      </p>

      <p className="font-normal text-xs leading-5 tracking-normal text-zinc-500 mb-2 mt-1 lg:text-sm lg:leading-6">
        Tap &apos;More Info&apos; on a partner card to see additional details like grievance
        officer, email, and website links.
      </p>


      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </FooterLinkPageWrapper>
  );
};

export default OurPartnersPage;
