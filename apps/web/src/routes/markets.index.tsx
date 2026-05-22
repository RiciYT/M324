import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MarketCard } from "@/components/market-card";
import { useMarkets } from "@/lib/market-hooks";

export const Route = createFileRoute("/markets/")({
  component: MarketsIndexRoute,
});

const filters = [
  { label: "Alle", value: "all" },
  { label: "Offen", value: "open" },
  { label: "Aufgelöst", value: "resolved" },
] as const;

type MarketFilter = (typeof filters)[number]["value"];

function MarketsIndexRoute() {
  const { data: markets, error, isLoading } = useMarkets();
  const [activeFilter, setActiveFilter] = useState<MarketFilter>("all");
  const filteredMarkets =
    markets?.filter(
      (market) => activeFilter === "all" || market.status === activeFilter
    ) ?? [];
  const openCount =
    markets?.filter((market) => market.status === "open").length ?? 0;
  const resolvedCount =
    markets?.filter((market) => market.status === "resolved").length ?? 0;
  const marketCount = markets?.length ?? 0;

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto flex max-w-[1320px] flex-col gap-5 px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-[#20231b] border-b pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-semibold text-4xl tracking-normal">Märkte</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400 leading-6">
              Offene und aufgelöste Fragen mit Quote, Pool und Ablaufdatum.
            </p>
            <p className="mt-3 font-mono text-xs text-zinc-500 tabular-nums">
              {marketCount} Märkte / {openCount} offen / {resolvedCount}{" "}
              aufgelöst
            </p>
          </div>
          <Link
            className="inline-flex h-10 w-fit items-center justify-center rounded-[6px] bg-[#c8ff00] px-4 font-medium text-black text-sm transition-[background-color,transform] duration-150 ease-out hover:bg-[#b7eb00] active:scale-[0.96]"
            to="/markets/new"
          >
            Neuer Markt
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={
                activeFilter === filter.value
                  ? "h-9 rounded-[6px] border border-[#c8ff00] bg-[#c8ff00] px-3 font-medium text-black text-sm transition-transform duration-150 ease-out active:scale-[0.96]"
                  : "h-9 rounded-[6px] border border-zinc-800 bg-[#11120f] px-3 text-sm text-zinc-200 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:border-zinc-700 hover:bg-zinc-900 active:scale-[0.96]"
              }
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              type="button"
            >
              {filter.label}{" "}
              <span className="font-mono tabular-nums">
                {getFilterCount({
                  filter: filter.value,
                  marketCount,
                  openCount,
                  resolvedCount,
                })}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-zinc-400">Märkte werden geladen…</p>
        ) : null}

        {error ? (
          <p className="rounded-[8px] border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
            Märkte konnten nicht geladen werden. Prüfe, ob der API-Server läuft.
          </p>
        ) : null}

        {!(isLoading || error) && filteredMarkets.length === 0 ? (
          <div className="rounded-[8px] border border-zinc-800 bg-[#11120f] p-5 text-sm text-zinc-400">
            In diesem Filter gibt es aktuell keine Märkte.
          </div>
        ) : null}

        <div className="border-zinc-800 border-b">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </section>
    </main>
  );
}

function getFilterCount({
  filter,
  marketCount,
  openCount,
  resolvedCount,
}: {
  filter: MarketFilter;
  marketCount: number;
  openCount: number;
  resolvedCount: number;
}) {
  if (filter === "open") {
    return openCount;
  }

  if (filter === "resolved") {
    return resolvedCount;
  }

  return marketCount;
}
