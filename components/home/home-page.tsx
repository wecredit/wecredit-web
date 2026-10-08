import React from 'react';
import HeroCarousel from './hero-carousel';
import StatsSection from './stats-section';
import ProductsSection from './products-section';
import TrendingOffersClient from './trending-offers-client';
import ToolsCalculatorsSection from './tools-calculators-section';
import TestimonialsSection from './testimonials-section';
import PartnersSection from './partners-section';
import CertificationsSection from './certifications-section';
import { FaqSection } from '@/components/shared';
import BlogSection from './blog-section';
import AppDownloadSection from './app-download-section';
import DreamsSection from './dreams-section';
import { PersonalLoanContent } from '@/components/personal-loan/personal-loan-content';
import MediaSection from './media-section';
import { MARKETPLACE_DISCLAIMER } from '@/lib/constants/common';

/**
 * Main home page component that composes all sections
 * Uses continuous gradient from blue to white across hero and stats
 * 
 * Lender Display Flow (PDF Steps 2 & 3):
 * - TrendingOffersClient handles all lender fetching internally
 * - Step 2: Generic lenders (client-side)
 * - Step 3: User-specific lenders when logged in (client-side)
 */
const HomePage = async (): Promise<React.ReactNode> => {
  // Generic lenders rendered server-side for the initial (crawlable) paint;
  // TrendingOffersClient still personalizes for logged-in users on the client.

  return (
    <div className="min-h-screen">
      {/* Gradient wrapper for Hero + Stats for seamless transition */}
      <div className="wc-hero-gradient-wrapper">
        {/* Hero Section with Carousel */}
        <HeroCarousel />
      </div>

      <StatsSection />

      {/* Products Section - on white background */}
      <ProductsSection />

      {/* Tools & Calculators Section */}
      <ToolsCalculatorsSection />

      {/* Trending Offers Section
          - Fetches generic lenders as fallback (PDF Step 2) - client-side
          - Fetches user-specific lenders when logged in (PDF Step 3) */}
      <TrendingOffersClient />

      {/* Certifications Section */}
      <CertificationsSection />

      {/* Testimonials Section */}
      {/* <TestimonialsSection /> */}

      {/* Our Partners Section */}
      <PartnersSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Blog Section */}
      <BlogSection />

      <MediaSection />

      {/* App Download Section */}
      <AppDownloadSection />

      {/* Dreams Section */}
      <DreamsSection />

      {/* Shared apply flow (auth/dedupe + lead form) for home page CTA */}
      <PersonalLoanContent />

      <div className="mt-8 pt-6">
        <p className="mx-auto max-w-4xl text-center text-xs sm:text-sm leading-relaxed text-gray-500">
          {MARKETPLACE_DISCLAIMER}
        </p>
      </div>
    </div>
  );
};

export default HomePage;
