import { useQuery } from "@tanstack/react-query";
import {
  apiClient,
  type LeaderboardEntry,
  type Market,
  type MarketActivity,
  type PortfolioPosition,
  type Transaction,
  type Wallet,
} from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { marketQueryKeys } from "@/lib/query-client";

interface AsyncState<TData> {
  data?: TData;
  error?: string;
  isLoading: boolean;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected request error";

export function useMarkets(): AsyncState<Market[]> {
  const query = useQuery({
    queryFn: () => apiClient.getMarkets(),
    queryKey: marketQueryKeys.markets,
  });

  return {
    data: query.data,
    error: query.error ? getErrorMessage(query.error) : undefined,
    isLoading: query.isPending,
  };
}

export function useMarket(id: string): AsyncState<Market> {
  const query = useQuery({
    queryFn: async () => {
      const data = await apiClient.getMarket(id);
      if (!data) {
        throw new Error("Market not found");
      }
      return data;
    },
    queryKey: marketQueryKeys.market(id),
  });

  return {
    data: query.data,
    error: query.error ? getErrorMessage(query.error) : undefined,
    isLoading: query.isPending,
  };
}

export function useMarketActivity(id: string): AsyncState<MarketActivity[]> {
  const query = useQuery({
    queryFn: () => apiClient.getMarketActivity(id),
    queryKey: marketQueryKeys.activity(id),
  });

  return {
    data: query.data,
    error: query.error ? getErrorMessage(query.error) : undefined,
    isLoading: query.isPending,
  };
}

export function useWallet(enabled = true): AsyncState<Wallet> {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const query = useQuery({
    enabled: enabled && Boolean(userId),
    queryFn: () => apiClient.getWallet(),
    queryKey: marketQueryKeys.wallet(userId),
  });

  return {
    data: query.data,
    error: query.error ? getErrorMessage(query.error) : undefined,
    isLoading: enabled && Boolean(userId) && query.isPending,
  };
}

export function usePortfolio(): AsyncState<{
  positions: PortfolioPosition[];
  transactions: Transaction[];
}> {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const query = useQuery({
    enabled: Boolean(userId),
    queryFn: () => apiClient.getPortfolio(),
    queryKey: marketQueryKeys.portfolio(userId),
  });

  return {
    data: query.data,
    error: query.error ? getErrorMessage(query.error) : undefined,
    isLoading: query.isPending,
  };
}

export function useLeaderboard(): AsyncState<LeaderboardEntry[]> {
  const query = useQuery({
    queryFn: () => apiClient.getLeaderboard(),
    queryKey: marketQueryKeys.leaderboard,
  });

  return {
    data: query.data,
    error: query.error ? getErrorMessage(query.error) : undefined,
    isLoading: query.isPending,
  };
}

export function useUserCount(): AsyncState<number> {
  const query = useQuery({
    queryFn: () => apiClient.getUserCount(),
    queryKey: marketQueryKeys.userCount,
  });

  return {
    data: query.data?.count,
    error: query.error ? getErrorMessage(query.error) : undefined,
    isLoading: query.isPending,
  };
}
