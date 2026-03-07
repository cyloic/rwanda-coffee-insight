import { useState, useEffect } from 'react';

interface CoffeePrices {
  globalBenchmark: {
    date: string;
    usd: number;
    rwf: number;
    source: string;
  };
  rwandaExport: {
    usd: number;
    rwf: number;
    source: string;
  };
  premium: string;
  lastUpdated: string;
}

export function useCoffeePrices() {
  const [prices, setPrices] = useState<CoffeePrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        const response = await fetch('/api/coffee-prices');
        
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setPrices(result.data);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error('Error fetching coffee prices:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
    
    // Refresh every hour
    const interval = setInterval(fetchPrices, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
}