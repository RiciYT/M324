import { env } from "@/lib/env";

export type MarketSide = "yes" | "no";
export type MarketStatus = "open" | "resolved";
export type UserRole = "admin" | "user" | string;
export type TransactionReason =
  | "bet"
  | "daily_claim"
  | "payout"
  | "signup_bonus";

export interface Market {
  closesAt: string;
  createdBy: string;
  description: string;
  id: string;
  noPool: number;
  outcome?: MarketSide;
  status: MarketStatus;
  title: string;
  yesPool: number;
}

export interface MarketActivity {
  amount: number;
  createdAt: string;
  id: string;
  side: MarketSide;
  userName: string;
}

export interface Wallet {
  canClaimDailyCoins: boolean;
  credits: number;
  nextDailyClaimAt?: string;
  role: UserRole;
}

export interface DailyClaimResult extends Wallet {
  grantedCredits: number;
}

export interface PortfolioPosition {
  amount: number;
  marketId: string;
  marketTitle: string;
  side: MarketSide;
}

export interface Transaction {
  amount: number;
  createdAt: string;
  id: string;
  marketTitle?: string;
  reason: TransactionReason;
}

export interface LeaderboardEntry {
  credits: number;
  name: string;
  pnl: number;
  rank: number;
}

async function request<TData>(
  path: string,
  init?: RequestInit
): Promise<TData> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${env.VITE_SERVER_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TData>;
}

export const apiClient = {
  createMarket(input: {
    closesAt: string;
    description: string;
    title: string;
  }): Promise<Market> {
    return request<Market>("/api/markets", {
      body: JSON.stringify(input),
      credentials: "include",
      method: "POST",
    });
  },
  claimDailyCoins(): Promise<DailyClaimResult> {
    return request<DailyClaimResult>("/api/wallet/claim", {
      credentials: "include",
      method: "POST",
    });
  },
  getLeaderboard(): Promise<LeaderboardEntry[]> {
    return request<LeaderboardEntry[]>("/api/leaderboard");
  },

  getUserCount(): Promise<{ count: number }> {
    return request<{ count: number }>("/api/users/count");
  },
  async getMarket(id: string): Promise<Market | undefined> {
    try {
      return await request<Market>(`/api/markets/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return;
      }

      throw error;
    }
  },
  getMarkets(): Promise<Market[]> {
    return request<Market[]>("/api/markets");
  },
  getMarketActivity(id: string): Promise<MarketActivity[]> {
    return request<MarketActivity[]>(`/api/markets/${id}/activity`);
  },
  getPortfolio(): Promise<{
    positions: PortfolioPosition[];
    transactions: Transaction[];
  }> {
    return request<{
      positions: PortfolioPosition[];
      transactions: Transaction[];
    }>("/api/portfolio", { credentials: "include" });
  },
  getWallet(): Promise<Wallet> {
    return request<Wallet>("/api/wallet", { credentials: "include" });
  },
  placeBet(input: {
    amount: number;
    marketId: string;
    side: MarketSide;
  }): Promise<{ accepted: true }> {
    return request<{ accepted: true }>("/api/bets", {
      body: JSON.stringify(input),
      credentials: "include",
      method: "POST",
    });
  },
  resolveMarket(input: {
    marketId: string;
    outcome: MarketSide;
  }): Promise<{ resolved: true }> {
    return request<{ resolved: true }>(
      `/api/markets/${input.marketId}/resolve`,
      {
        body: JSON.stringify(input),
        credentials: "include",
        method: "POST",
      }
    );
  },
};
