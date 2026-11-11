import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono, Poppins, Manrope } from 'next/font/google';
import './globals.css';
import ConditionalMobileHeader from '@/components/layout/conditional-mobile-header';
import ConditionalFooter from '@/components/layout/conditional-footer';
import { AuthModal } from '@/components/auth';
import { AuthProvider } from '@/providers/auth-provider';
import { OpenNativeAppProvider } from '@/providers/open-native-app-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { FeatureFlagProvider } from '@/providers/feature-flag-provider';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { SITE_NAME } from '@/lib/config/site-navigation';
import { buildAbsoluteSiteUrl, getWebsiteBaseUrl, OG_IMAGE_URL } from '@/lib/seo/site-metadata';
import { buildOrganizationJsonLd } from '@/lib/seo/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

/**
 * Metadata
 */
const defaultTitle = 'WeCredit - Quick Personal Loans';
const defaultDescription =
  'Get instant access to personal loans with WeCredit. Quick approval, minimal documentation, and competitive rates.';
const defaultUrl = buildAbsoluteSiteUrl('/');

export const metadata: Metadata = {
  metadataBase: new URL(getWebsiteBaseUrl()),
  title: defaultTitle,
  description: defaultDescription,
  alternates: {
    canonical: defaultUrl,
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: defaultUrl,
    siteName: 'WeCredit',
    type: 'website',
    images: [
      {
        url: OG_IMAGE_URL,
        alt: 'WeCredit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [OG_IMAGE_URL],
  },
};

/**
 * Viewport (moved out of metadata)
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Root layout component
 *
 * Auth Flow (PDF Step 1):
 * AuthProvider validates existing token on app mount
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-y-none">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${manrope.variable} ${poppins.className} antialiased min-h-screen flex flex-col`}
      >
        {/* GTM lives in <body> — do not wrap in a manual <head>; Next.js manages head via Metadata API (title, canonical, etc.) */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TMJBLB7R');
          `}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TMJBLB7R"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Organization schema — server-rendered so it lands in the initial HTML */}
        <JsonLd data={buildOrganizationJsonLd()} />
        {/* FeatureFlagProvider must wrap everything for dev tools */}
        <FeatureFlagProvider>
          <OpenNativeAppProvider />
          {/* Suspense only around AuthProvider (useSearchParams) — not the page body */}
          <Suspense fallback={null}>
            <AuthProvider>
              <ToastProvider />
              <AuthModal />
              <LoadingScreen />
            </AuthProvider>
          </Suspense>
          <ConditionalMobileHeader siteName={SITE_NAME} />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
