import { useCallback, useEffect, useReducer } from "react";
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

type AsyncAction<TData> =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; data: TData }
  | { type: "error"; error: string };

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected request error";

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  enabled = true,
  refreshKey = 0
): AsyncState<T> {
  const [state, dispatch] = useReducer(
    (_currentState: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> => {
      switch (action.type) {
        case "idle":
          return { data: undefined, error: undefined, isLoading: false };
        case "loading":
          return { data: undefined, error: undefined, isLoading: true };
        case "success":
          return { data: action.data, isLoading: false };
        case "error":
          return { error: action.error, isLoading: false };
        default:
          return _currentState;
      }
    },
    {
      isLoading: true,
    }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey intentionally triggers refetches without being read.
  useEffect(() => {
    if (!enabled) {
      dispatch({ type: "idle" });
      return;
    }

    let isActive = true;
    dispatch({ type: "loading" });

    fetcher()
      .then((data) => {
        if (isActive) {
          dispatch({ type: "success", data });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          dispatch({ type: "error", error: getErrorMessage(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [enabled, fetcher, refreshKey]);

  return state;
}

export function useMarkets(): AsyncState<Market[]> {
  const fetchMarkets = useCallback(() => apiClient.getMarkets(), []);
  return useAsyncData(fetchMarkets);
}

export function useMarket(id: string, refreshKey = 0): AsyncState<Market> {
  const fetchMarket = useCallback(async () => {
    const data = await apiClient.getMarket(id);
    if (!data) {
      throw new Error("Market not found");
    }
    return data;
  }, [id]);

  return useAsyncData(fetchMarket, true, refreshKey);
}

export function useMarketActivity(
  id: string,
  refreshKey = 0
): AsyncState<MarketActivity[]> {
  const fetchActivity = useCallback(
    () => apiClient.getMarketActivity(id),
    [id]
  );

  return useAsyncData(fetchActivity, true, refreshKey);
}

export function useWallet(enabled = true): AsyncState<Wallet> {
  const fetchWallet = useCallback(() => apiClient.getWallet(), []);
  return useAsyncData(fetchWallet, enabled);
}

export function usePortfolio(): AsyncState<{
  positions: PortfolioPosition[];
  transactions: Transaction[];
}> {
  const fetchPortfolio = useCallback(() => apiClient.getPortfolio(), []);
  return useAsyncData(fetchPortfolio);
}

export function useLeaderboard(): AsyncState<LeaderboardEntry[]> {
  const fetchLeaderboard = useCallback(() => apiClient.getLeaderboard(), []);
  return useAsyncData(fetchLeaderboard);
}

export function useUserCount(): AsyncState<number> {
  const fetchUserCount = useCallback(() => apiClient.getUserCount(), []);
  const state = useAsyncData(fetchUserCount);
  return {
    data: state.data?.count,
    error: state.error,
    isLoading: state.isLoading,
  };
}
