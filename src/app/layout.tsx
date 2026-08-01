import type { Metadata } from "next";
import { Montserrat, Cairo, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/admin.css";
import "@/styles/blocks.css";
import "@/styles/sections.css";
import db from "@/lib/db";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  preload: false,
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
  let faviconUrl = "/favicon.ico";

  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['site_name', 'site_tagline', 'seo_title', 'seo_description', 'site_logo_light', 'site_logo_dark'] } }
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    
    siteName = map.site_name || siteName;
    title = map.seo_title || map.site_name || title;
    description = map.seo_description || map.site_tagline || description;
    faviconUrl = map.site_logo_light || map.site_logo_dark || faviconUrl;
  } catch (e) {
    console.error("Error generating metadata", e);
  }

  return { 
    title, 
    description,
    keywords: ["software", "cloud", "saas", "agency", siteName],
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
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
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { RecaptchaProvider } from '@/components/providers/RecaptchaProvider';

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
  let tiktokId = "";
  let siteCurrency = "USD";
  let faviconUrl = "/favicon.ico";
  let whatsappNum = "";
  
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['app_primary_color', 'app_accent_color', 'app_custom_css', 'app_dark_mode', 'seo_ga', 'seo_fb', 'seo_tiktok', 'site_currency', 'site_logo_light', 'site_logo_dark', 'int_whatsapp'] } }
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    primary = map.app_primary_color || "";
    accent = map.app_accent_color || "";
    customCss = map.app_custom_css || "";
    darkMode = map.app_dark_mode || "false";
    gaId = map.seo_ga || "";
    fbId = map.seo_fb || "";
    tiktokId = map.seo_tiktok || "";
    siteCurrency = map.site_currency || "USD";
    faviconUrl = map.site_logo_light || map.site_logo_dark || "/favicon.ico";
    whatsappNum = map.int_whatsapp || "";
  } catch (e) {
    console.error("Error fetching settings in root layout", e);
  }

  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${montserrat.variable} ${cairo.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href={faviconUrl} />
        
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

        {/* TikTok Pixel */}
        {tiktokId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                  ttq.load('${tiktokId}');
                  ttq.page();
                }(window, document, 'ttq');
              `,
            }}
          />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TroveSeek",
              "url": "https://troveseek.com",
              "logo": "https://troveseek.com/images/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-800-555-1212",
                "contactType": "Customer Service"
              }
            })
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider currencyCode={siteCurrency}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <RecaptchaProvider>
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
                <Toaster richColors position="top-center" />

                {/* WhatsApp Floating Widget */}
                {whatsappNum && (
                  <a
                    href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: 'fixed',
                      bottom: '24px',
                      right: '24px',
                      width: '60px',
                      height: '60px',
                      background: '#25D366',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                      zIndex: 9999,
                      transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                )}
              </RecaptchaProvider>
            </ThemeProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
