import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
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

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto flex max-w-[1540px] flex-col gap-6 px-5 py-8 sm:px-8 lg:px-14">
        <div className="flex flex-col gap-4 border-[#20231b] border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-semibold text-4xl uppercase tracking-normal">
              Märkte
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400 leading-6">
              Alle offenen und aufgelösten ShitMarket-Fragen mit Pool, Quote und
              Ablaufdatum.
            </p>
            <p className="mt-3 font-mono text-xs text-zinc-500 tabular-nums">
              {markets?.length ?? 0} Märkte / {openCount} offen /{" "}
              {resolvedCount} aufgelöst
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[6px] bg-[#c8ff00] px-4 font-black text-black text-xs uppercase hover:bg-[#c8ff00]/90"
            to="/markets/new"
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            Neuer Markt
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={
                activeFilter === filter.value
                  ? "h-10 rounded-[6px] border border-[#c8ff00] bg-[#c8ff00] px-4 font-black text-black text-xs uppercase"
                  : "h-10 rounded-[6px] border border-zinc-800 bg-[#11120f] px-4 font-black text-xs text-zinc-300 uppercase hover:bg-zinc-900"
              }
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-zinc-400">Märkte werden geladen…</p>
        ) : null}

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {!(isLoading || error) && filteredMarkets.length === 0 ? (
          <div className="border border-zinc-800 bg-[#11120f] p-5 text-sm text-zinc-400">
            In diesem Filter gibt es aktuell keine Märkte.
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </section>
    </main>
  );
}
