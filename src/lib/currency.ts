export function formatServerPrice(amount: number, currency: string = 'USD', locale: string = 'en') {
  if (currency === 'DZD') {
    const symbol = locale === 'ar' ? 'د.ج' : 'DZD';
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}
