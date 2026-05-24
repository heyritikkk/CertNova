import { useState, useEffect } from 'react';

export function useCurrency() {
  const [currency, setCurrency] = useState('USD');
  const [symbol, setSymbol] = useState('$');
  const [rate, setRate] = useState(1);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // If user is in India, use INR
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
        setCurrency('INR');
        setSymbol('₹');
        setRate(83); // Approx conversion rate
      } else {
        setCurrency('USD');
        setSymbol('$');
        setRate(1);
      }
    } catch (err) {
      // Fallback to USD if Intl fails
      setCurrency('USD');
      setSymbol('$');
      setRate(1);
    }
  }, []);

  const formatPrice = (usdPrice) => {
    const num = Number(usdPrice);
    if (isNaN(num) || num <= 0) return 'Free';
    
    const converted = num * rate;
    
    if (currency === 'INR') {
      // In India, prices are typically rounded to nearest integer
      return `${symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    
    // For USD, keep 2 decimal places if there are cents, otherwise whole number is fine
    return `${symbol}${converted.toFixed(2)}`;
  };

  return { currency, symbol, rate, formatPrice };
}
