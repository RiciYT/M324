import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { MarketCard } from "@/components/market-card";
import { useMarkets } from "@/lib/market-hooks";

export const Route = createFileRoute("/markets")({
  component: MarketsRoute,
});

function MarketsRoute() {
  const { data: markets, error, isLoading } = useMarkets();

  return (
    <main className="min-h-0 overflow-y-auto">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-border border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-semibold text-3xl">Markets</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-6">
              Mock-first market feed for the prediction-market workflow.
            </p>
          </div>
          <Link
            className="inline-flex h-8 items-center justify-center gap-1.5 border border-transparent bg-primary px-2.5 font-medium text-primary-foreground text-xs hover:bg-primary/80"
            to="/markets/new"
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            New market
          </Link>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading markets...</p>
        ) : null}

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {markets?.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </section>
    </main>
  );
}
