import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      staleTime: 60 * 1000,
    },
  },
});

export const marketQueryKeys = {
  activity: (id: string) => ["markets", id, "activity"] as const,
  leaderboard: ["leaderboard"] as const,
  market: (id: string) => ["markets", id] as const,
  markets: ["markets"] as const,
  portfolio: (userId?: string) =>
    userId ? (["portfolio", userId] as const) : (["portfolio"] as const),
  userCount: ["users", "count"] as const,
  wallet: (userId?: string) =>
    userId ? (["wallet", userId] as const) : (["wallet"] as const),
};
