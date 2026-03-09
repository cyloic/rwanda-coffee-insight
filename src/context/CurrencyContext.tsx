import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "RWF" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  exchangeRate: number;
  usdToRwf: (usd: number) => number;
  rwfToUsd: (rwf: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("RWF");
  const [exchangeRate, setExchangeRate] = useState<number>(1350);

  useEffect(() => {
    fetch('/api/coffee-prices')
      .then(r => r.json())
      .then(result => {
        if (result?.data?.exchangeRate) setExchangeRate(result.data.exchangeRate);
      })
      .catch(() => {});
  }, []);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "RWF" ? "USD" : "RWF"));
  };

  const usdToRwf = (usd: number) => Math.round(usd * exchangeRate);
  const rwfToUsd = (rwf: number) => Math.round((rwf / exchangeRate) * 100) / 100;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency, exchangeRate, usdToRwf, rwfToUsd }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
