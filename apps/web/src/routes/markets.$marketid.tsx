// biome-ignore-all lint/style/useFilenamingConvention: TanStack Router uses $param filenames for dynamic routes.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BetForm } from "@/components/bet-form";
import { Button } from "@/components/button";
import { MarketPoolChart } from "@/components/market-pool-chart";
import { apiClient, type MarketSide } from "@/lib/api-client";
import { useMarket, useMarketActivity, useWallet } from "@/lib/market-hooks";
import { useFormattedDate } from "@/lib/use-formatted-date";

const creditFormatter = new Intl.NumberFormat("de-CH");
const dateFormatter = new Intl.DateTimeFormat("de-CH", {
  dateStyle: "full",
});
const percentFormatter = new Intl.NumberFormat("de-CH", {
  maximumFractionDigits: 0,
  style: "percent",
});

export const Route = createFileRoute("/markets/$marketid")({
  component: MarketDetailRoute,
});

function MarketDetailRoute() {
  const { marketid } = Route.useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [resolveError, setResolveError] = useState<string>();
  const [isResolving, setIsResolving] = useState(false);
  const { data: market, error, isLoading } = useMarket(marketid, refreshKey);
  const { data: activity, isLoading: isActivityLoading } = useMarketActivity(
    marketid,
    refreshKey
  );
  const { data: wallet } = useWallet();
  const closesAt = useFormattedDate(market?.closesAt, dateFormatter);

  if (isLoading) {
    return (
      <main className="bg-[#050604] p-8 text-sm text-zinc-400">
        Markt wird geladen…
      </main>
    );
  }

  if (error || !market) {
    return (
      <main className="bg-[#050604] p-8 text-destructive text-sm">
        {error ?? "Markt nicht gefunden"}
      </main>
    );
  }

  const totalPool = market.yesPool + market.noPool;
  const yesRatio = totalPool === 0 ? 0.5 : market.yesPool / totalPool;
  const noRatio = 1 - yesRatio;
  const yesLabel = `Ja ${percentFormatter.format(yesRatio)}`;
  const noLabel = `Nein ${percentFormatter.format(noRatio)}`;
  const statusLabel = market.status === "open" ? "Offen" : "Aufgelöst";
  const isAdmin = wallet?.role === "admin";

  const handleResolve = async (outcome: MarketSide) => {
    setIsResolving(true);
    setResolveError(undefined);

    try {
      await apiClient.resolveMarket({
        marketId: market.id,
        outcome,
      });
      setRefreshKey((value) => value + 1);
    } catch (error_) {
      setResolveError(
        error_ instanceof Error
          ? error_.message
          : "Markt konnte nicht aufgelöst werden"
      );
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto grid max-w-[1320px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10">
        <article className="min-w-0">
          <div className="mb-7 flex flex-col gap-4 border-[#20231b] border-b pb-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span>{statusLabel}</span>
              <span>{closesAt}</span>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-semibold text-3xl text-wrap-balance leading-tight tracking-normal sm:text-4xl">
                  {market.title}
                </h1>
                <p className="mt-3 max-w-2xl text-zinc-400 leading-6">
                  {market.description}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 font-mono text-sm tabular-nums">
                <span className="text-[#c8ff00]">{yesLabel}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-destructive">{noLabel}</span>
              </div>
            </div>
          </div>

          <section aria-label="Marktverlauf" className="mb-8">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="font-semibold text-zinc-100">Marktverlauf</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {creditFormatter.format(totalPool)} Coins Volumen
                </p>
              </div>
              <div className="font-mono text-sm text-zinc-500 tabular-nums">
                Jetzt
              </div>
            </div>
            <MarketPoolChart
              className="h-[320px]"
              noPool={market.noPool}
              yesPool={market.yesPool}
            />
          </section>

          <section
            aria-labelledby="activity-heading"
            className="border-[#20231b] border-t pt-6"
          >
            <div className="mb-4">
              <h2 className="font-semibold text-xl" id="activity-heading">
                Aktivität
              </h2>
            </div>
            <div className="divide-y divide-zinc-800 border-zinc-800 border-y">
              {activity?.map((item) => (
                <ActivityLine
                  amount={`+${creditFormatter.format(item.amount)} ${
                    item.side === "yes" ? "Ja" : "Nein"
                  }`}
                  key={item.id}
                  name={item.userName}
                />
              ))}
              {isActivityLoading ? (
                <div className="bg-[#0b0c0a] px-4 py-3 text-sm text-zinc-500">
                  Aktivität wird geladen…
                </div>
              ) : null}
              {isActivityLoading || activity?.length ? null : (
                <div className="bg-[#0b0c0a] px-4 py-3 text-sm text-zinc-500">
                  Noch keine Wetten platziert.
                </div>
              )}
            </div>
          </section>
        </article>

        <aside className="lg:sticky lg:top-[94px] lg:self-start">
          <div className="rounded-[8px] border border-zinc-800 bg-[#11120f]">
            <div className="border-zinc-800 border-b p-4">
              <p className="text-sm text-zinc-500">Kaufen</p>
              <p className="mt-1 font-semibold text-lg text-wrap-balance">
                {market.title}
              </p>
            </div>
            <div className="p-4">
              <BetForm
                marketId={market.id}
                noLabel={noLabel}
                onBetPlaced={() => setRefreshKey((value) => value + 1)}
                yesLabel={yesLabel}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500 leading-5">
            Der aktuelle Preis basiert auf der Verteilung im Pool. Diese
            Schulversion simuliert den Markt ohne Orderbuch.
          </p>
          {isAdmin ? (
            <AdminResolvePanel
              isResolving={isResolving}
              marketStatus={market.status}
              onResolve={handleResolve}
              outcome={market.outcome}
              resolveError={resolveError}
            />
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function AdminResolvePanel({
  isResolving,
  marketStatus,
  onResolve,
  outcome,
  resolveError,
}: {
  isResolving: boolean;
  marketStatus: "open" | "resolved";
  onResolve: (outcome: MarketSide) => void;
  outcome?: MarketSide;
  resolveError?: string;
}) {
  const isResolved = marketStatus === "resolved";

  return (
    <section
      aria-labelledby="admin-resolve-heading"
      className="mt-5 rounded-[8px] border border-[#c8ff00]/30 bg-[#11120f] p-4"
    >
      <div className="mb-4">
        <h2 className="font-semibold text-sm" id="admin-resolve-heading">
          Admin Resolve
        </h2>
        <p className="text-xs text-zinc-500">
          Nur sichtbar für Benutzer mit Admin-Rolle.
        </p>
      </div>

      {isResolved ? (
        <p className="rounded-[6px] border border-zinc-800 bg-black/20 p-3 text-sm text-zinc-300">
          Markt ist bereits auf{" "}
          <span className="font-semibold text-zinc-100">
            {outcome === "yes" ? "Ja" : "Nein"}
          </span>{" "}
          aufgelöst.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-10 rounded-[6px] bg-[#c8ff00] font-black text-black hover:bg-[#c8ff00]/90"
            disabled={isResolving}
            onClick={() => onResolve("yes")}
            type="button"
          >
            Ja gewinnt
          </Button>
          <Button
            className="h-10 rounded-[6px] bg-destructive font-black text-white hover:bg-destructive/90"
            disabled={isResolving}
            onClick={() => onResolve("no")}
            type="button"
          >
            Nein gewinnt
          </Button>
        </div>
      )}

      {resolveError ? (
        <p className="mt-3 rounded-[6px] border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
          {resolveError}
        </p>
      ) : null}
    </section>
  );
}

function ActivityLine({ amount, name }: { amount: string; name: string }) {
  return (
    <div className="flex items-center justify-between bg-[#0b0c0a] px-4 py-3 text-sm">
      <span className="font-semibold text-zinc-200">{name}</span>
      <span className="font-mono text-zinc-400 tabular-nums">{amount}</span>
    </div>
  );
}
