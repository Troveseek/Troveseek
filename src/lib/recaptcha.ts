import db from './db';

/**
 * Verify a Google reCAPTCHA v3 token on the server side.
 * Returns { success, score } — rejects if score < 0.5 (likely bot).
 */
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  try {
    // Try env var first, then fall back to DB setting
    let secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      const setting = await db.siteSetting.findUnique({
        where: { key: 'legal_captcha_secret' },
      });
      secretKey = setting?.value || '';
    }

    if (!secretKey) {
      console.warn('⚠️ reCAPTCHA secret key not configured. Skipping verification.');
      return { success: true, score: 1.0 }; // Allow through if not configured
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.warn('reCAPTCHA verification failed:', data['error-codes']);
      return { success: false, score: 0 };
    }

    // reCAPTCHA v3 returns a score from 0.0 (bot) to 1.0 (human)
    const score = data.score ?? 0;
    return { success: score >= 0.5, score };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, score: 0 };
  }
}

/**
 * List of known disposable/temporary email domains.
 * Emails from these domains are blocked during registration.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular disposable services
  'emailinbo.live', 'tempmail.com', 'guerrillamail.com', 'guerrillamail.info',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.de', 'grr.la',
  'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator.info',
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.org',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr',
  'tempail.com', 'tempr.email', 'temp-mail.org', 'temp-mail.io',
  'throwaway.email', 'throwawaymail.com', 'dispostable.com',
  'maildrop.cc', 'mailnesia.com', 'mailcatch.com', 'mailexpire.com',
  'mailmoat.com', 'mailnull.com', 'mailsac.com', 'mailtemp.info',
  'mohmal.com', 'getnada.com', 'abyssmail.com', 'emailondeck.com',
  'fakeinbox.com', 'filzmail.com', 'getairmail.com', 'harakirimail.com',
  'inboxalias.com', 'incognitomail.org', 'jetable.org', 'kasmail.com',
  'mailforspam.com', 'mailhazard.com', 'mailhazard.us', 'mailquack.com',
  'mintemail.com', 'mytemp.email', 'mytrashmail.com', 'notsharingmy.info',
  'ownmail.net', 'pookmail.com', 'proxymail.eu', 'rcpt.at',
  'reallymymail.com', 'recode.me', 'regbypass.com', 'safetymail.info',
  'sharklasers.com', 'shieldedmail.com', 'spamavert.com', 'spambox.us',
  'spamcero.com', 'spamex.com', 'spamfree24.org', 'spamgourmet.com',
  'spamhole.com', 'spamify.com', 'spamspot.com', 'superrito.com',
  'teleworm.us', 'tempemail.co.za', 'tempemail.net', 'tempinbox.com',
  'tempmail.eu', 'tempmailer.com', 'tempomail.fr', 'temporaryemail.net',
  'temporaryforwarding.com', 'temporarymail.org', 'thanksnospam.info',
  'trashymail.com', 'trashymail.net', 'tmail.ws', 'uggsrock.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wh4f.org', 'yolanda.dev',
  'zeroe.ml', 'zoemail.org', '10minutemail.com', '10minutemail.net',
  'binkmail.com', 'bobmail.info', 'burnthismail.com', 'buyusedlibrarybooks.org',
  'crazymailing.com', 'deadaddress.com', 'despammed.com', 'devnullmail.com',
  'disposeamail.com', 'dodgeit.com', 'dodgit.com', 'emailigo.de',
  'emailisvalid.com', 'emailsensei.com', 'emailtemporario.com.br',
  'emz.net', 'enterto.com', 'eyepaste.com', 'fastacura.com',
  'fivemail.de', 'fleckens.hu', 'get2mail.fr', 'girlsundertheinfluence.com',
  'grandmamail.com', 'great-host.in', 'greensloth.com', 'haltospam.com',
  'hotpop.com', 'ichimail.com', 'imails.info', 'insorg.org',
  'ipoo.org', 'irish2me.com', 'iwi.net', 'jetable.com',
  'klassmaster.com', 'klzlk.com', 'koszmail.pl', 'kurzepost.de',
  'lifebyfood.com', 'link2mail.net', 'litedrop.com', 'lookugly.com',
  'lortemail.dk', 'lr78.com', 'lroid.com', 'lukop.dk',
  'mailblocks.com', 'mailcatch.com', 'maileater.com', 'mailfreeonline.com',
]);

/**
 * Check if an email domain is a known disposable/temporary email provider.
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
