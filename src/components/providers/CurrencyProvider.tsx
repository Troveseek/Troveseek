"use client";

import React, { createContext, useContext } from 'react';
import { useLocale } from 'next-intl';

type CurrencyContextType = {
  currencyCode: string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currencyCode: 'USD',
});

export const CurrencyProvider = ({
  currencyCode,
  children,
}: {
  currencyCode: string;
  children: React.ReactNode;
}) => {
  return (
    <CurrencyContext.Provider value={{ currencyCode: currencyCode || 'USD' }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  
  const locale = useLocale();

  const formatPrice = (amount: number, forceCurrency?: string) => {
    const currency = forceCurrency || context.currencyCode || 'USD';
    
    if (currency === 'DZD') {
      const symbol = locale === 'ar' ? 'د.ج' : 'DZD';
      return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    } catch (e) {
      // Fallback if currency code is invalid
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
  };

  return {
    currencyCode: context.currencyCode,
    formatPrice,
  };
};
