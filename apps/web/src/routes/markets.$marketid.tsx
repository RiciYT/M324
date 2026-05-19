// biome-ignore-all lint/style/useFilenamingConvention: TanStack Router uses $param filenames for dynamic routes.
import { createFileRoute } from "@tanstack/react-router";
import { Clock, ShieldCheck, TrendingUp } from "lucide-react";
import { BetForm } from "@/components/bet-form";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { MarketPoolChart } from "@/components/market-pool-chart";
import { useMarket } from "@/lib/market-hooks";

const canResolveMarkets = false;
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
  const statusLabel = market.status === "open" ? "Offen" : "Aufgeloest";

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto grid max-w-[1540px] gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-14">
        <div className="flex flex-col gap-5">
          <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
            <CardHeader className="py-6">
              <CardTitle className="font-black text-3xl text-wrap-balance uppercase">
                {market.title}
              </CardTitle>
              <CardDescription className="text-zinc-400 leading-6">
                {market.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 pb-6">
              <div className="grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
                <Metric label="Status" value={statusLabel} />
                <Metric
                  label="Ja-Quote"
                  tone="yes"
                  value={percentFormatter.format(yesRatio)}
                />
                <Metric
                  label="Nein-Quote"
                  tone="no"
                  value={percentFormatter.format(noRatio)}
                />
                <Metric
                  label="Total Pool"
                  value={`${creditFormatter.format(totalPool)} Coins`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 overflow-hidden border border-zinc-800 bg-black">
                  <div
                    className="h-full bg-[#c8ff00]"
                    style={{ width: `${Math.round(yesRatio * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-xs text-zinc-500 tabular-nums">
                  <span>Ja {percentFormatter.format(yesRatio)}</span>
                  <span>Nein {percentFormatter.format(noRatio)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
            <CardHeader className="py-5">
              <CardTitle className="flex items-center gap-2 font-black text-xl uppercase">
                <TrendingUp aria-hidden="true" className="text-[#c8ff00]" />
                Aktivitaet
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Letzte Einsaetze auf diesem Markt.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pb-6">
              <ActivityLine amount="+120 Ja" name="Shezi" />
              <ActivityLine amount="+80 Nein" name="Imad" />
              <ActivityLine amount="+200 Ja" name="Rici" />
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-[94px] lg:self-start">
          <Card className="rounded-[8px] border border-[#c8ff00]/40 bg-[#11120f] py-0 text-zinc-100 ring-0">
            <CardHeader className="py-5">
              <CardTitle className="font-black text-xl uppercase">
                Wette setzen
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-zinc-400">
                <Clock aria-hidden="true" className="size-4" />
                Schliesst {dateFormatter.format(new Date(market.closesAt))}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <BetForm marketId={market.id} />
            </CardContent>
          </Card>

          <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
            <CardHeader className="py-5">
              <CardTitle className="font-black text-xl uppercase">
                Pool
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Verteilung der aktuellen Coins.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pb-6">
              <MarketPoolChart
                noPool={market.noPool}
                yesPool={market.yesPool}
              />
              <Metric
                label="Ja Pool"
                tone="yes"
                value={`${creditFormatter.format(market.yesPool)} Coins`}
              />
              <Metric
                label="Nein Pool"
                tone="no"
                value={`${creditFormatter.format(market.noPool)} Coins`}
              />
            </CardContent>
          </Card>

          {canResolveMarkets ? (
            <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
              <CardHeader className="py-5">
                <CardTitle>Admin</CardTitle>
                <CardDescription>
                  Resolve controls are shown only when admin access is
                  available.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 pb-6">
                <Button variant="outline">
                  <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                  Ja
                </Button>
                <Button variant="outline">
                  <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                  Nein
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function Metric({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "neutral" | "yes" | "no";
  value: string;
}) {
  let valueClassName = "text-zinc-100";

  if (tone === "yes") {
    valueClassName = "text-[#c8ff00]";
  }

  if (tone === "no") {
    valueClassName = "text-destructive";
  }

  return (
    <div className="bg-[#050604] p-4">
      <p className="text-xs text-zinc-500 uppercase">{label}</p>
      <p
        className={`mt-2 font-black font-mono text-lg tabular-nums ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

function ActivityLine({ amount, name }: { amount: string; name: string }) {
  return (
    <div className="flex items-center justify-between border border-zinc-800 bg-black/20 p-3 text-sm">
      <span className="font-semibold text-zinc-200">{name}</span>
      <span className="font-mono text-zinc-400 tabular-nums">{amount}</span>
    </div>
  );
}
