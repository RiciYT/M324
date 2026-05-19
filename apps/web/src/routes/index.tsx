import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Flame, Radio, Trophy } from "lucide-react";
import { Button } from "@/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import type { LeaderboardEntry, Market } from "@/lib/api-client";
import { useLeaderboard, useMarkets } from "@/lib/market-hooks";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const coinFormatter = new Intl.NumberFormat("de-CH");
const percentFormatter = new Intl.NumberFormat("de-CH", {
  maximumFractionDigits: 0,
  style: "percent",
});
const marketSkeletonKeys = [
  "market-skeleton-one",
  "market-skeleton-two",
  "market-skeleton-three",
  "market-skeleton-four",
] as const;

function HomeComponent() {
  const {
    data: markets,
    error: marketsError,
    isLoading: marketsLoading,
  } = useMarkets();
  const {
    data: leaderboard,
    error: leaderboardError,
    isLoading: leaderboardLoading,
  } = useLeaderboard();
  const featuredMarkets = markets?.slice(0, 4) ?? [];
  const activeMarkets =
    markets?.filter((market) => market.status === "open") ?? [];
  const totalPool =
    markets?.reduce((sum, market) => sum + getTotalPool(market), 0) ?? 0;
  const topUsers = leaderboard?.slice(0, 4) ?? [];

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="relative isolate overflow-hidden border-[#20231b] border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(200,255,0,0.2),transparent_28%),linear-gradient(90deg,#080907_0%,#090a08_45%,rgba(8,9,7,0.62)_74%,#0a0a08_100%)]" />
        <div className="absolute right-0 bottom-0 hidden h-full w-[52%] overflow-hidden lg:block">
          <div className="absolute right-[11%] bottom-0 h-[360px] w-[285px] rounded-t-[46%] bg-[linear-gradient(115deg,#2b261f,#695a48_44%,#141412)] shadow-[inset_28px_0_0_rgba(255,255,255,0.07)]" />
          <div className="absolute right-[19%] bottom-[232px] h-28 w-48 rounded-[48%] bg-[linear-gradient(145deg,#6f6250,#1d1c18)] shadow-[inset_18px_5px_0_rgba(255,255,255,0.1)]" />
          <div className="absolute right-[23%] bottom-[278px] h-11 w-40 -rotate-2 rounded-full border border-black/80 bg-black/85" />
          <div className="absolute right-[27%] bottom-[260px] h-4 w-12 rounded-full bg-black" />
          <div className="absolute right-[8%] bottom-[86px] rotate-[-7deg] border border-black/25 bg-[#a06f43] px-10 py-8 text-center font-black text-4xl text-[#17110c] leading-none shadow-2xl">
            TO THE
            <br />
            MOON?
            <br />
            <span className="text-2xl">LOL</span>
          </div>
          <div className="absolute right-[3%] bottom-[32px] grid h-32 w-32 rotate-12 place-items-center bg-[#c8ff00] text-center font-black text-black text-xl leading-none [clip-path:polygon(50%_0%,61%_22%,85%_15%,78%_39%,100%_50%,78%_61%,85%_85%,61%_78%,50%_100%,39%_78%,15%_85%,22%_61%,0%_50%,22%_39%,15%_15%,39%_22%)]">
            100%
            <br />
            NUTZLOS
          </div>
        </div>

        <div className="relative mx-auto grid max-w-[1540px] gap-8 px-5 py-12 sm:px-8 lg:min-h-[560px] lg:items-center lg:px-14">
          <div className="max-w-[720px]">
            <h1 className="font-black text-5xl uppercase leading-[0.9] tracking-normal sm:text-7xl lg:text-8xl">
              Die dümmsten Fragen.
              <span className="block text-[#c8ff00]">Echte Wetten.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-300 leading-7">
              ShitMarket ist die Polymarket-Parodie für sinnfreie Prognosen.
              Umfragen, Pools, Wallet und Rangliste werden über die vorhandene
              Datenlogik geladen.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-[6px] bg-[#c8ff00] px-6 font-black text-black uppercase hover:bg-[#c8ff00]/90"
                render={<Link to="/markets" />}
              >
                <Flame aria-hidden="true" data-icon="inline-start" />
                Märkte ansehen
              </Button>
              <Button
                className="h-12 rounded-[6px] border-zinc-600 px-6 font-black uppercase"
                render={<Link to="/portfolio" />}
                variant="outline"
              >
                <Coins aria-hidden="true" data-icon="inline-start" />
                Portfolio öffnen
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-[#20231b] border-b">
        <div className="mx-auto grid max-w-[1540px] gap-px bg-[#20231b] sm:grid-cols-3">
          <Metric label="Aktive Märkte" value={activeMarkets.length} />
          <Metric label="Geladene Märkte" value={markets?.length ?? 0} />
          <Metric
            label="Gesamter Pool"
            value={`${coinFormatter.format(totalPool)} Coins`}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1540px] px-5 py-6 sm:px-8 lg:px-14">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-black text-2xl uppercase tracking-normal">
            Beliebte Märkte
          </h2>
          <Button render={<Link to="/markets" />} variant="outline">
            Alle Märkte ansehen
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Button>
        </div>

        {marketsError ? (
          <Card className="border-destructive/40 bg-card">
            <CardHeader>
              <CardTitle>Märkte konnten nicht geladen werden</CardTitle>
              <CardDescription>{marketsError}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {marketsLoading ? <MarketSkeletons /> : null}
          {featuredMarkets.map((market) => (
            <MarketPreviewCard key={market.id} market={market} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1540px] gap-4 px-5 pb-8 sm:px-8 lg:grid-cols-[2fr_1fr] lg:px-14">
        <Card className="border-zinc-800 bg-[#11120f] text-zinc-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-black text-xl uppercase">
              <Radio aria-hidden="true" className="text-[#c8ff00]" />
              Marktaktivität
            </CardTitle>
            <CardDescription>
              Diese Liste verwendet dieselben geladenen Umfragen wie die
              Marktübersicht.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {marketsLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : null}
            {marketsError ? (
              <p className="text-destructive text-sm">
                Marktaktivität konnte nicht geladen werden.
              </p>
            ) : null}
            <div className="divide-y divide-zinc-800">
              {activeMarkets.slice(0, 4).map((market) => (
                <div
                  className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_88px_88px_120px] md:items-center"
                  key={market.id}
                >
                  <span className="font-medium text-zinc-200">
                    {market.title}
                  </span>
                  <span className="font-bold font-mono text-[#c8ff00]">
                    Ja {getSidePrice(market, "yes")}
                  </span>
                  <span className="font-bold font-mono text-destructive">
                    Nein {getSidePrice(market, "no")}
                  </span>
                  <span className="font-mono text-zinc-300">
                    {coinFormatter.format(getTotalPool(market))} Coins
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-[#11120f] text-zinc-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-black text-xl uppercase">
              <Trophy aria-hidden="true" className="text-[#c8ff00]" />
              Bestenliste
            </CardTitle>
            <CardAction>
              <Button
                render={<Link to="/leaderboard" />}
                size="sm"
                variant="ghost"
              >
                Öffnen
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : null}
            {leaderboardError ? (
              <p className="text-destructive text-sm">
                Rangliste konnte nicht geladen werden.
              </p>
            ) : null}
            <ol className="divide-y divide-zinc-800">
              {topUsers.map((user) => (
                <li
                  className="grid grid-cols-[34px_1fr_auto] items-center gap-3 py-3"
                  key={user.name}
                >
                  <span className="font-mono text-zinc-500">{user.rank}</span>
                  <span className="font-semibold text-zinc-300">
                    {user.name}
                  </span>
                  <span className="font-black font-mono text-[#c8ff00]">
                    {formatLeaderboardProfit(user)}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#050604] px-5 py-4 sm:px-8 lg:px-14">
      <p className="text-xs text-zinc-500 uppercase">{label}</p>
      <p className="mt-1 font-black font-mono text-[#c8ff00] text-xl">
        {value}
      </p>
    </div>
  );
}

function MarketPreviewCard({ market }: { market: Market }) {
  return (
    <Card className="border-zinc-800 bg-[#11120f] text-zinc-100">
      <CardHeader>
        <CardTitle className="font-black text-base leading-tight">
          {market.title}
        </CardTitle>
        <CardDescription>{market.description}</CardDescription>
        <CardAction>
          <span className="border border-zinc-700 px-2 py-1 font-bold text-[10px] text-zinc-400 uppercase">
            {market.status === "open" ? "Offen" : "Aufgelöst"}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_1px_1fr] items-center gap-3">
          <PoolSide label="Ja" value={getSidePrice(market, "yes")} />
          <div className="h-12 bg-zinc-800" />
          <PoolSide label="Nein" tone="no" value={getSidePrice(market, "no")} />
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="font-mono text-xs text-zinc-400">
          {coinFormatter.format(getTotalPool(market))} Coins
        </span>
        <Button
          render={
            <Link params={{ marketid: market.id }} to="/markets/$marketid" />
          }
          size="sm"
          variant="outline"
        >
          Öffnen
          <ArrowRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function PoolSide({
  label,
  tone = "yes",
  value,
}: {
  label: string;
  tone?: "yes" | "no";
  value: string;
}) {
  return (
    <div className="border border-zinc-800 bg-black/25 p-3">
      <p className="text-xs text-zinc-500 uppercase">{label}</p>
      <p
        className={
          tone === "yes"
            ? "mt-1 font-black font-mono text-[#c8ff00] text-xl"
            : "mt-1 font-black font-mono text-destructive text-xl"
        }
      >
        {value}
      </p>
    </div>
  );
}

function MarketSkeletons() {
  return marketSkeletonKeys.map((key) => (
    <Card className="border-zinc-800 bg-[#11120f]" key={key}>
      <CardHeader>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  ));
}

function getTotalPool(market: Market) {
  return market.yesPool + market.noPool;
}

function getSidePrice(market: Market, side: "yes" | "no") {
  const totalPool = getTotalPool(market);

  if (totalPool === 0) {
    return percentFormatter.format(0.5);
  }

  const yesShare = market.yesPool / totalPool;
  const value = side === "yes" ? yesShare : 1 - yesShare;

  return percentFormatter.format(value);
}

function formatLeaderboardProfit(user: LeaderboardEntry) {
  const sign = user.pnl > 0 ? "+" : "";

  return `${sign}${coinFormatter.format(user.pnl)}`;
}
