import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/admin.css";
import "@/styles/blocks.css";
import "@/styles/sections.css";
import db from "@/lib/db";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  let title = "TroveSeek Ltd";
  let description = "Beyond Search. Beyond Expectations.";
  let siteName = "TroveSeek";
  let url = process.env.NEXTAUTH_URL || "https://troveseek.com";

  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['site_name', 'site_tagline', 'seo_title', 'seo_description'] } }
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    
    siteName = map.site_name || siteName;
    title = map.seo_title || map.site_name || title;
    description = map.seo_description || map.site_tagline || description;
  } catch (e) {
    console.error("Error generating metadata", e);
  }

  return { 
    title, 
    description,
    keywords: ["software", "cloud", "saas", "agency", siteName],
    openGraph: {
      title,
      description,
      siteName,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { CurrencyProvider } from '@/components/providers/CurrencyProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let primary = "";
  let accent = "";
  let customCss = "";
  let darkMode = "false";
  let gaId = "";
  let fbId = "";
  let siteCurrency = "USD";
  
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['app_primary_color', 'app_accent_color', 'app_custom_css', 'app_dark_mode', 'seo_ga', 'seo_fb', 'site_currency'] } }
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    primary = map.app_primary_color || "";
    accent = map.app_accent_color || "";
    customCss = map.app_custom_css || "";
    darkMode = map.app_dark_mode || "false";
    gaId = map.seo_ga || "";
    fbId = map.seo_fb || "";
    siteCurrency = map.site_currency || "USD";
  } catch (e) {
    console.error("Error fetching settings in root layout", e);
  }

  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${darkMode === 'true' ? 'dark' : ''}`} suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Facebook Pixel */}
        {fbId && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${fbId}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img height="1" width="1" style={{ display: 'none' }}
                   src={`https://www.facebook.com/tr?id=${fbId}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider currencyCode={siteCurrency}>
            {(primary || accent || customCss) ? (
              <style dangerouslySetInnerHTML={{ __html: `
                :root {
                  ${primary ? `--clr-primary: ${primary} !important;` : ''}
                  ${accent ? `--clr-accent: ${accent} !important;` : ''}
                }
                ${customCss}
              `}} />
            ) : null}
            {children}
            <Toaster position="top-right" richColors />
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
