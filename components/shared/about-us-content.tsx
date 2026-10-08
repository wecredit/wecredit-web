'use client';
import React from 'react';
import { BackToHomeButton } from './back-to-home-button';
import { ACHIEVEMENTS, BRANDS, TERMS_DISCLAIMER } from '@/lib/constants/common';
import { useIsMobilePlatform } from '@/hooks/use-is-mobile-platform';
import PageHeading from './page-heading';

interface InfoCardProps {
  image: string;
  alt: string;
  title: string;
  description?: string;
  mb?: string;
}

const InfoCard = ({
  image,
  alt,
  title,
  description,
  mb = 'mb-4',
}: InfoCardProps) => (
  <div
    className={`w-full bg-white rounded-lg shadow-[1px_1px_4px_0px_#6666661A,-1px_-1px_4px_0px_#6666661A] overflow-hidden ${mb}`}
  >
    <div className="w-full aspect-361/261">
      <img src={image} alt={alt} className="w-full h-full object-cover" />
    </div>

    <div className="p-3 text-center">
      <h3 className=" font-medium text-base leading-none tracking-normal text-zinc-800">
        {title}
      </h3>

      {description && (
        <>
          <div className="h-2" />
          <p className=" font-normal text-sm leading-[1.2] tracking-normal text-zinc-500">
            {description}
          </p>
        </>
      )}
    </div>
  </div>
);

interface BrandCardProps {
  name: string;
  logo: string;
  url: string;
  displayUrl: string;
}

const BrandCard = ({ name, logo, url, displayUrl }: BrandCardProps) => (
  <div className="w-full bg-white rounded-lg shadow-[1px_1px_4px_0px_#6666661A,-1px_-1px_4px_0px_#6666661A] overflow-hidden">
    <div className="flex items-center justify-center h-24 p-4">
      <img
        src={logo}
        alt={`${name} logo`}
        className="max-h-full max-w-full object-contain"
      />
    </div>

    <div className="p-3 text-center border-t border-zinc-100">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className=" font-normal text-sm leading-[1.2] tracking-normal text-[#045BCF] hover:underline"
      >
        {displayUrl}
      </a>
    </div>
  </div>
);

const AboutUsContent = (): React.ReactNode => {
  const isMobilePlatform = useIsMobilePlatform();
  return (
    <div className={`w-full lg:-mt-10  ${!isMobilePlatform ? 'pt-18' : ''} pb-8 md:pt-28 md:pb-12`}>

      <div className="bg-[linear-gradient(96.83deg,#CCDFFC_35.72%,#FAFCFF_100%)] px-4 py-6 mb-4">
        {!isMobilePlatform && (
          <div>
            <BackToHomeButton />
          </div>
        )}

        <PageHeading className=" font-medium text-2xl leading-none tracking-normal text-zinc-800">
          About WeCredit
        </PageHeading>

        <div className="h-4" />

        <p className=" font-normal text-sm leading-[1.2] tracking-normal text-zinc-600">
          At WeCredit, we believe that managing credit should be easy and transparent without confusion or hidden details.
        </p>
      </div>

      <div className="px-4">

        {/* Hero Image */}
        <div className="w-full overflow-hidden mb-8">
          <img
            src="https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/Heroimage.png"
            alt="About WeCredit"
            className="w-full h-auto object-cover"
          />
        </div>

        <h3 className=" font-medium text-base leading-[1] tracking-normal text-zinc-800 mb-4">
          We make personal finance simple and transparent.
        </h3>

        {/* <p className=" font-normal text-sm leading-[1.2] tracking-normal text-[#7F7F7F] mb-8">
          With the help of data and technology, WeCredit lets you view and compare multiple loan and card offers in one place. We share clear and unbiased information to help you make better decisions and support you throughout your credit journey.
        </p> */}

        <p className=" font-normal text-sm leading-[1.2] tracking-normal text-[#7F7F7F] mb-8">
          {TERMS_DISCLAIMER}
        </p>

        {/* Team */}
        {/* <h3 className=" font-medium text-base leading-[1] tracking-normal text-zinc-800 mb-4">
          Meet the Team Behind WeCredit
        </h3>

        <p className=" font-normal text-sm leading-[1.2] tracking-normal text-[#7F7F7F] mb-10">
          Our leadership team brings experience from key areas of the business, including finance, operations, risk, and growth.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((member, index) => (
            <InfoCard
              key={index}
              image={member.image}
              alt={member.title}
              title={member.title}
            />
          ))}
        </div> */}

        {/* Timeline */}
        {/* <div className="mb-6 mt-8">
          <h2 className=" font-medium text-base leading-[1] tracking-normal text-black">
            Our Journey
          </h2>
        </div>

        <div className="relative w-full">
          <div className="absolute left-[42px] top-0 bottom-0 w-[2px] bg-[#D9D9D9]" />

          <div className="space-y-10">
            {[
              {
                year: '2022',
                title: 'The Beginning',
                desc:
                  'WeCredit started under the name Spiraea Digital Private Limited...',
                dot: '#045BCF',
              },
              {
                year: '2025',
                title: 'Growth & Rebranding',
                desc:
                  'The company became QuantumX Global Private Limited...',
                dot: '#00F076',
              },
            ].map((item, index) => (
              <div key={index} className="relative flex">
                <div
                  className="w-6 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: item.dot }}
                />

                <div className="ml-8 flex-1">
                  <div className=" font-medium text-sm leading-[1.2] text-[#045BCF]">
                    {item.year}
                  </div>

                  <div className="mt-1  font-medium text-base leading-[1.2] text-[#045BCF]">
                    {item.title}
                  </div>

                  <p className="mt-2  font-normal text-sm leading-[1.2] text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            <div className="relative flex">
              <div className="w-6 h-6 rounded-full bg-[#D9D9D9] shrink-0" />

              <div className="ml-8 flex-1">
                <div className=" font-medium text-sm leading-[1.2] text-[#045BCF]">
                  2026
                </div>

                <div className="mt-3 p-4 rounded-lg border border-dashed border-[#045BCF] bg-[linear-gradient(96.83deg,_#CCDFFC_35.72%,_#FAFCFF_100%)]">
                  <p className=" font-normal text-sm leading-[1.2] text-[#045BCF]">
                    Since then, WeCredit has been helping people get credit easily and quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Achievements */}
        <div className="mb-6 mt-8">
          <h2 className=" font-medium text-base leading-[1] tracking-normal text-black">
            Our Achievements & Partnerships
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((item, index) => (
            <InfoCard
              key={index}
              image={item.image}
              alt={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        {/* Our Brands */}
        <div className="mb-6 mt-8">
          <h2 className=" font-medium text-base leading-[1] tracking-normal text-black">
            Our Brands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {BRANDS.map((brand) => (
            <BrandCard
              key={brand.name}
              name={brand.name}
              logo={brand.logo}
              url={brand.url}
              displayUrl={brand.displayUrl}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AboutUsContent;
