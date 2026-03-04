import { useQuery } from '@tanstack/react-query';

export function useBTCPrice() {
  return useQuery({
    queryKey: ['btc-price'],
    queryFn: async () => {
      // Use CoinGecko API for reliability
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      if (!res.ok) throw new Error('Failed to fetch BTC price');
      const data = await res.json();
      return data.bitcoin.usd;
    },
    staleTime: 60_000, // 1 minute
    refetchInterval: 60_000,
  });
}
