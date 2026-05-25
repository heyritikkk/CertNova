import { useState, useEffect } from 'react';

export function useCurrency() {
  const currency = 'INR';
  const symbol = '₹';
  const rate = 1;

  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num) || num <= 0) return 'Free';
    
    // The price in the DB is already in INR, so just format it
    return `${symbol}${Math.round(num).toLocaleString('en-IN')}`;
  };

  return { currency, symbol, rate, formatPrice };
}
