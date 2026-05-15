import { useEffect, useState } from "react";
import {
  apiClient,
  type LeaderboardEntry,
  type Market,
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
  dependencies: React.DependencyList
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    isLoading: true,
  });

  useEffect(() => {
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
    // biome-ignore lint/correctness/useExhaustiveDependencies: caller explicitly provides the dependencies
  }, dependencies);

  return state;
}

export function useMarkets(): AsyncState<Market[]> {
  return useAsyncData(() => apiClient.getMarkets(), []);
}

export function useMarket(id: string): AsyncState<Market> {
  return useAsyncData(async () => {
    const data = await apiClient.getMarket(id);
    if (!data) {
      throw new Error("Market not found");
    }
    return data;
  }, [id]);
}

export function useWallet(): AsyncState<Wallet> {
  return useAsyncData(() => apiClient.getWallet(), []);
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
