export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export interface CountryPreset {
  code: string;
  name: string;
  nameAr: string;
  currency: string;
  taxRate: number;
  methods: string[];
  defaultLanguage: string;
}

export const COUNTRY_PRESETS: CountryPreset[] = [
  {
    code: 'dz',
    name: 'Algeria',
    nameAr: 'الجزائر',
    currency: 'DZD',
    taxRate: 0,
    methods: ['Baridi Mob', 'Binance', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'us',
    name: 'United States',
    nameAr: 'الولايات المتحدة',
    currency: 'USD',
    taxRate: 0,
    methods: ['Stripe', 'Crypto'],
    defaultLanguage: 'en'
  },
  {
    code: 'ae',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    currency: 'AED',
    taxRate: 5,
    methods: ['Stripe', 'Binance', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'sa',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    currency: 'SAR',
    taxRate: 15,
    methods: ['Stripe', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'gb',
    name: 'United Kingdom',
    nameAr: 'المملكة المتحدة',
    currency: 'GBP',
    taxRate: 20,
    methods: ['Stripe'],
    defaultLanguage: 'en'
  },
  {
    code: 'fr',
    name: 'France',
    nameAr: 'فرنسا',
    currency: 'EUR',
    taxRate: 20,
    methods: ['Stripe'],
    defaultLanguage: 'fr'
  },
  {
    code: 'de',
    name: 'Germany',
    nameAr: 'ألمانيا',
    currency: 'EUR',
    taxRate: 19,
    methods: ['Stripe'],
    defaultLanguage: 'de'
  },
  {
    code: 'ca',
    name: 'Canada',
    nameAr: 'كندا',
    currency: 'CAD',
    taxRate: 13,
    methods: ['Stripe'],
    defaultLanguage: 'en'
  },
  {
    code: 'qa',
    name: 'Qatar',
    nameAr: 'قطر',
    currency: 'QAR',
    taxRate: 0,
    methods: ['Stripe', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'kw',
    name: 'Kuwait',
    nameAr: 'الكويت',
    currency: 'KWD',
    taxRate: 0,
    methods: ['Stripe', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'eg',
    name: 'Egypt',
    nameAr: 'مصر',
    currency: 'EGP',
    taxRate: 14,
    methods: ['Stripe', 'Binance', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'ma',
    name: 'Morocco',
    nameAr: 'المغرب',
    currency: 'MAD',
    taxRate: 20,
    methods: ['Stripe', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'tn',
    name: 'Tunisia',
    nameAr: 'تونس',
    currency: 'TND',
    taxRate: 19,
    methods: ['Stripe', 'Crypto'],
    defaultLanguage: 'ar'
  },
  {
    code: 'tr',
    name: 'Turkey',
    nameAr: 'تركيا',
    currency: 'TRY',
    taxRate: 20,
    methods: ['Stripe', 'Crypto', 'Binance'],
    defaultLanguage: 'tr'
  },
  {
    code: 'es',
    name: 'Spain',
    nameAr: 'إسبانيا',
    currency: 'EUR',
    taxRate: 21,
    methods: ['Stripe'],
    defaultLanguage: 'es'
  },
  {
    code: 'it',
    name: 'Italy',
    nameAr: 'إيطاليا',
    currency: 'EUR',
    taxRate: 22,
    methods: ['Stripe'],
    defaultLanguage: 'it'
  }
];

export const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'DZD', name: 'Algerian Dinar (د.ج)', symbol: 'د.ج' },
  { code: 'SAR', name: 'Saudi Riyal (ر.س)', symbol: 'ر.س' },
  { code: 'AED', name: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'QAR', name: 'Qatari Riyal (ر.ق)', symbol: 'ر.ق' },
  { code: 'KWD', name: 'Kuwaiti Dinar (د.ك)', symbol: 'د.ك' },
  { code: 'CAD', name: 'Canadian Dollar ($)', symbol: 'CA$' },
  { code: 'EGP', name: 'Egyptian Pound (ج.م)', symbol: 'ج.م' },
  { code: 'MAD', name: 'Moroccan Dirham (د.م.)', symbol: 'د.م.' },
  { code: 'TRY', name: 'Turkish Lira (₺)', symbol: '₺' },
];

export const STANDARD_PAYMENT_METHODS = [
  { id: 'Stripe', label: 'Stripe (Cards)', color: 'var(--clr-primary)' },
  { id: 'Baridi Mob', label: 'Baridi Mob', color: '#00e5b0' },
  { id: 'Binance', label: 'Binance Pay', color: '#f3ba2f' },
  { id: 'Crypto', label: 'Crypto (USDT / BTC)', color: '#ffaa00' },
  { id: 'PayPal', label: 'PayPal', color: '#0070ba' },
  { id: 'Bank Transfer', label: 'Bank Wire / Transfer', color: '#8b5cf6' },
  { id: 'Cash on Delivery', label: 'Cash on Delivery', color: '#10b981' },
];

/**
 * Safely parse payment methods from DB (handles single strings, JSON arrays, double stringification, etc.)
 */
export function parsePaymentMethods(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(item => typeof item === 'string' && item.trim().length > 0);
  
  let current = raw;
  // Unwrap nested stringified layers
  for (let i = 0; i < 3; i++) {
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        try {
          current = JSON.parse(trimmed);
        } catch {
          break;
        }
      } else {
        break;
      }
    }
  }

  if (Array.isArray(current)) {
    return current.filter(item => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof current === 'string' && current.trim().length > 0) {
    // If it's comma-separated
    return current.split(',').map(s => s.trim()).filter(Boolean);
  }

  return [];
}

/**
 * Normalizes payment methods into a clean JSON string ready for DB storage
 */
export function normalizeMethodsForDb(methods: any): string {
  const parsed = parsePaymentMethods(methods);
  return JSON.stringify(parsed);
}

/**
 * Convert 2-letter ISO country code (e.g. "DZ", "US", "FR") to Unicode flag emoji
 */
export function getCountryFlag(code?: string): string {
  if (!code || typeof code !== 'string') return '🌐';
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== 2) return '🌐';
  
  // Calculate regional indicator symbols
  const codePoints = cleanCode
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}
