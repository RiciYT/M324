import { useEffect, useState } from "react";
import {
  apiClient,
  type LeaderboardEntry,
  type Market,
  type MarketActivity,
  type PortfolioPosition,
  type Transaction,
  type Wallet,
} from "@/lib/api-client";

interface AsyncState<TData> {
  data?: TData;
  error?: string;
  isLoading: boolean;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected request error";

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  dependencies: React.DependencyList,
  enabled = true
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    isLoading: true,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: caller explicitly provides the refetch dependencies
  useEffect(() => {
    if (!enabled) {
      setState({ data: undefined, error: undefined, isLoading: false });
      return;
    }

    let isActive = true;
    setState({ isLoading: true, data: undefined, error: undefined });

    fetcher()
      .then((data) => {
        if (isActive) {
          setState({ data, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({ error: getErrorMessage(error), isLoading: false });
        }
      });

    return () => {
      isActive = false;
    };
  }, [...dependencies, enabled]);

  return state;
}

export function useMarkets(): AsyncState<Market[]> {
  return useAsyncData(() => apiClient.getMarkets(), []);
}

export function useMarket(id: string, refreshKey = 0): AsyncState<Market> {
  return useAsyncData(async () => {
    const data = await apiClient.getMarket(id);
    if (!data) {
      throw new Error("Market not found");
    }
    return data;
  }, [id, refreshKey]);
}

export function useMarketActivity(
  id: string,
  refreshKey = 0
): AsyncState<MarketActivity[]> {
  return useAsyncData(() => apiClient.getMarketActivity(id), [id, refreshKey]);
}

export function useWallet(enabled = true): AsyncState<Wallet> {
  return useAsyncData(() => apiClient.getWallet(), [], enabled);
}

export function usePortfolio(): AsyncState<{
  positions: PortfolioPosition[];
  transactions: Transaction[];
}> {
  return useAsyncData(() => apiClient.getPortfolio(), []);
}

export function useLeaderboard(): AsyncState<LeaderboardEntry[]> {
  return useAsyncData(() => apiClient.getLeaderboard(), []);
}
