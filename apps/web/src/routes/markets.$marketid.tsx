// biome-ignore-all lint/style/useFilenamingConvention: TanStack Router uses $param filenames for dynamic routes.
import { createFileRoute } from "@tanstack/react-router";
import { Clock, TrendingUp } from "lucide-react";
import { BetForm } from "@/components/bet-form";
import { MarketPoolChart } from "@/components/market-pool-chart";
import { useMarket } from "@/lib/market-hooks";

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
  const { data: market, error, isLoading } = useMarket(marketid);

  if (isLoading) {
    return (
      <main className="bg-[#050604] p-8 text-sm text-zinc-400">
        Markt wird geladen...
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

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto grid max-w-[1320px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10">
        <article className="min-w-0">
          <div className="mb-7 flex flex-col gap-4 border-[#20231b] border-b pb-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span>ShitMarket</span>
              <span>/</span>
              <span>{statusLabel}</span>
              <span className="inline-flex items-center gap-1">
                <Clock aria-hidden="true" className="size-4" />
                {dateFormatter.format(new Date(market.closesAt))}
              </span>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-black text-3xl text-wrap-balance leading-tight tracking-normal sm:text-4xl">
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
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp aria-hidden="true" className="text-[#c8ff00]" />
              <h2 className="font-black text-xl" id="activity-heading">
                Aktivität
              </h2>
            </div>
            <div className="divide-y divide-zinc-800 border-zinc-800 border-y">
              <ActivityLine amount="+120 Ja" name="Shezi" />
              <ActivityLine amount="+80 Nein" name="Imad" />
              <ActivityLine amount="+200 Ja" name="Rici" />
            </div>
          </section>
        </article>

        <aside className="lg:sticky lg:top-[94px] lg:self-start">
          <div className="rounded-[8px] border border-zinc-800 bg-[#11120f]">
            <div className="border-zinc-800 border-b p-4">
              <p className="text-sm text-zinc-500">Kaufen</p>
              <p className="mt-1 font-black text-lg text-wrap-balance">
                {market.title}
              </p>
            </div>
            <div className="p-4">
              <BetForm
                marketId={market.id}
                noLabel={noLabel}
                yesLabel={yesLabel}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500 leading-5">
            Der aktuelle Preis basiert auf der Verteilung im Pool. Diese
            Schulversion simuliert den Markt ohne Orderbuch.
          </p>
        </aside>
      </section>
    </main>
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
