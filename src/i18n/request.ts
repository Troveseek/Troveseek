import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value;

  if (!locale) {
    // Default to site_language setting if no cookie
    try {
      const defaultLangSetting = await db.siteSetting.findUnique({ where: { key: 'site_language' } });
      locale = defaultLangSetting?.value || 'en';
    } catch (e) {
      locale = 'en';
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
