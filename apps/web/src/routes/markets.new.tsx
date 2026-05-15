import { createFileRoute } from "@tanstack/react-router";
import { MarketCreateForm } from "@/components/market-create-form";

export const Route = createFileRoute("/markets/new")({
  component: NewMarketRoute,
});

function NewMarketRoute() {
  return (
    <main className="min-h-0 overflow-y-auto">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border border-b pb-6">
          <h1 className="font-semibold text-3xl">New Market</h1>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            Create flow prepared with mock submission until the API is merged.
          </p>
        </div>
        <MarketCreateForm />
      </section>
    </main>
  );
}
