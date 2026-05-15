export type MarketSide = "yes" | "no";
export type MarketStatus = "open" | "resolved";
export type TransactionReason = "bet" | "payout" | "signup_bonus";

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

export interface Wallet {
  credits: number;
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

const DEMO_DELAY_MS = 180;

const createMarketSlug = (title: string) =>
  title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 48);

const createUniqueMarketId = (title: string) => {
  const baseSlug = createMarketSlug(title) || "market";
  let candidate = baseSlug;
  let suffix = 2;

  while (mockMarkets.some((market) => market.id === candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const mockMarkets: Market[] = [
  {
    id: "gta-release",
    title: "Hält Rockstar den 19.11.2026 für GTA 6 ohne dritte Verschiebung?",
    description:
      "YES wenn GTA 6 genau am angekündigten Datum live geht. Verschiebungen oder Early Access zählen als NO.",
    createdBy: "System",
    closesAt: "2026-11-19T18:00:00.000Z",
    status: "open",
    yesPool: 12_450,
    noPool: 8120,
  },
  {
    id: "nvidia-ai-count",
    title:
      "Sagt Jensen Huang in der nächsten Nvidia-Keynote das Wort AI mehr als 100 Mal?",
    description:
      "Gezählt werden nur gesprochene Erwähnungen im offiziellen Livestream.",
    createdBy: "System",
    closesAt: "2026-07-13T20:00:00.000Z",
    status: "open",
    yesPool: 6880,
    noPool: 9300,
  },
  {
    id: "linux-desktop",
    title:
      "Erreicht Linux 2026 erstmals mehr als 5 Prozent Desktop-Marktanteil?",
    description:
      "Stichtag ist der Dezember-Snapshot von StatCounter. ChromeOS zählt nicht.",
    createdBy: "System",
    closesAt: "2026-12-31T23:00:00.000Z",
    status: "open",
    yesPool: 5420,
    noPool: 4760,
  },
  {
    id: "ipa-grade",
    title: "Schafft Mathias seine IPA mit Note 5 oder besser?",
    description:
      "Gemeinsamer Demo-Markt für die Klasse. YES wenn die Schlussnote mindestens 5.0 ist.",
    createdBy: "System",
    closesAt: "2026-05-28T16:00:00.000Z",
    status: "open",
    yesPool: 16_000,
    noPool: 2500,
  },
];

const mockPortfolio: PortfolioPosition[] = [
  {
    amount: 120,
    marketId: "ipa-grade",
    marketTitle: "Schafft Mathias seine IPA mit Note 5 oder besser?",
    side: "yes",
  },
  {
    amount: 80,
    marketId: "nvidia-ai-count",
    marketTitle:
      "Sagt Jensen Huang in der nächsten Nvidia-Keynote das Wort AI mehr als 100 Mal?",
    side: "no",
  },
];

const mockTransactions: Transaction[] = [
  {
    id: "tx-signup",
    amount: 1000,
    createdAt: "2026-05-10T08:30:00.000Z",
    reason: "signup_bonus",
  },
  {
    id: "tx-ipa",
    amount: -120,
    createdAt: "2026-05-11T12:45:00.000Z",
    marketTitle: "Schafft Mathias seine IPA mit Note 5 oder besser?",
    reason: "bet",
  },
  {
    id: "tx-nvidia",
    amount: -80,
    createdAt: "2026-05-12T17:10:00.000Z",
    marketTitle:
      "Sagt Jensen Huang in der nächsten Nvidia-Keynote das Wort AI mehr als 100 Mal?",
    reason: "bet",
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Rici", credits: 1540, pnl: 540 },
  { rank: 2, name: "Imad", credits: 1320, pnl: 320 },
  { rank: 3, name: "Shezi", credits: 1180, pnl: 180 },
  { rank: 4, name: "Demo User", credits: 800, pnl: -200 },
];

const waitForMockResponse = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, DEMO_DELAY_MS);
  });

export const apiClient = {
  async createMarket(input: {
    closesAt: string;
    description: string;
    title: string;
  }): Promise<Market> {
    await waitForMockResponse();

    const market: Market = {
      id: createUniqueMarketId(input.title),
      title: input.title,
      description: input.description,
      createdBy: "You",
      closesAt: input.closesAt,
      status: "open",
      yesPool: 0,
      noPool: 0,
    };

    mockMarkets.unshift(market);

    return market;
  },
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await waitForMockResponse();

    return mockLeaderboard;
  },
  async getMarket(id: string): Promise<Market | undefined> {
    await waitForMockResponse();

    return mockMarkets.find((market) => market.id === id);
  },
  async getMarkets(): Promise<Market[]> {
    await waitForMockResponse();

    return mockMarkets;
  },
  async getPortfolio(): Promise<{
    positions: PortfolioPosition[];
    transactions: Transaction[];
  }> {
    await waitForMockResponse();

    return {
      positions: mockPortfolio,
      transactions: mockTransactions,
    };
  },
  async getWallet(): Promise<Wallet> {
    await waitForMockResponse();

    return {
      credits: 800,
    };
  },
  async placeBet(input: {
    amount: number;
    marketId: string;
    side: MarketSide;
  }): Promise<{ accepted: true }> {
    await waitForMockResponse();

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    return { accepted: true };
  },
  async resolveMarket(input: {
    marketId: string;
    outcome: MarketSide;
  }): Promise<{ resolved: true }> {
    await waitForMockResponse();

    if (!input.marketId) {
      throw new Error("Market id is required");
    }

    return { resolved: true };
  },
};
