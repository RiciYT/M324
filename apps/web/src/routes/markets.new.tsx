import { createFileRoute } from "@tanstack/react-router";
import { MarketCreateForm } from "@/components/market-create-form";

export const Route = createFileRoute("/markets/new")({
  component: NewMarketRoute,
});

function NewMarketRoute() {
  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-14">
        <div className="border-[#20231b] border-b pb-6">
          <h1 className="font-black text-4xl uppercase tracking-normal">
            Neuer Markt
          </h1>
          <p className="mt-2 text-sm text-zinc-400 leading-6">
            Lege eine neue absurde Prognosefrage mit Beschreibung und
            Ablaufdatum an.
          </p>
        </div>
        <MarketCreateForm />
      </section>
    </main>
  );
}
