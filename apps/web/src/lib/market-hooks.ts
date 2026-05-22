import { useEffect, useReducer } from "react";
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
  dependencies: React.DependencyList,
  enabled = true
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: caller explicitly provides the refetch dependencies
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

export function useUserCount(): AsyncState<number> {
  const state = useAsyncData(() => apiClient.getUserCount(), []);
  return {
    data: state.data ? state.data.count : undefined,
    error: state.error,
    isLoading: state.isLoading,
  } as AsyncState<number>;
}
