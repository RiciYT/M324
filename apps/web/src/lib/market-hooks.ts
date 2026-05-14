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

export function useMarkets(): AsyncState<Market[]> {
  const [state, setState] = useState<AsyncState<Market[]>>({
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    apiClient
      .getMarkets()
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
  }, []);

  return state;
}

export function useMarket(id: string): AsyncState<Market> {
  const [state, setState] = useState<AsyncState<Market>>({
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    apiClient
      .getMarket(id)
      .then((data) => {
        if (!isActive) {
          return;
        }

        if (!data) {
          setState({ error: "Market not found", isLoading: false });
          return;
        }

        setState({ data, isLoading: false });
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({ error: getErrorMessage(error), isLoading: false });
        }
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  return state;
}

export function useWallet(): AsyncState<Wallet> {
  const [state, setState] = useState<AsyncState<Wallet>>({
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    apiClient
      .getWallet()
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
  }, []);

  return state;
}

export function usePortfolio(): AsyncState<{
  positions: PortfolioPosition[];
  transactions: Transaction[];
}> {
  const [state, setState] = useState<
    AsyncState<{
      positions: PortfolioPosition[];
      transactions: Transaction[];
    }>
  >({
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    apiClient
      .getPortfolio()
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
  }, []);

  return state;
}

export function useLeaderboard(): AsyncState<LeaderboardEntry[]> {
  const [state, setState] = useState<AsyncState<LeaderboardEntry[]>>({
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    apiClient
      .getLeaderboard()
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
  }, []);

  return state;
}
