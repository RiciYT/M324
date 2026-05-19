import { createFileRoute } from "@tanstack/react-router";
import { Medal, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import type { LeaderboardEntry } from "@/lib/api-client";
import { useLeaderboard } from "@/lib/market-hooks";

const creditFormatter = new Intl.NumberFormat("de-CH");

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardRoute,
});

function LeaderboardRoute() {
  const { data: leaderboard, error, isLoading } = useLeaderboard();
  const topThree = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-8 sm:px-8 lg:px-14">
        <div className="border-[#20231b] border-b pb-6">
          <h1 className="font-black text-4xl uppercase tracking-normal">
            Bestenliste
          </h1>
          <p className="mt-2 text-sm text-zinc-400 leading-6">
            Ranking nach Coins und Gewinn oder Verlust.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topThree.map((entry) => (
            <TopRankCard entry={entry} key={entry.rank} />
          ))}
        </div>

        <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
          <CardHeader className="py-5">
            <CardTitle className="flex items-center gap-2 font-black text-xl uppercase">
              <Trophy aria-hidden="true" className="text-[#c8ff00]" />
              Alle Trader
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Credits und PnL sauber ausgerichtet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pb-6">
            {isLoading ? (
              <p className="text-sm text-zinc-400">
                Bestenliste wird geladen...
              </p>
            ) : null}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {rest.map((entry) => (
              <div
                className="grid grid-cols-[48px_1fr_auto_auto] items-center gap-3 border border-zinc-800 bg-black/20 p-3 text-sm"
                key={entry.rank}
              >
                <span className="font-mono text-zinc-500">#{entry.rank}</span>
                <span className="font-semibold text-zinc-200">
                  {entry.name}
                </span>
                <span className="font-mono text-zinc-300 tabular-nums">
                  {creditFormatter.format(entry.credits)}
                </span>
                <span
                  className={
                    entry.pnl >= 0
                      ? "text-right font-black font-mono text-[#c8ff00] tabular-nums"
                      : "text-right font-black font-mono text-destructive tabular-nums"
                  }
                >
                  {entry.pnl > 0 ? "+" : ""}
                  {creditFormatter.format(entry.pnl)}
                </span>
              </div>
            ))}
            {!(isLoading || error) && leaderboard?.length === 0 ? (
              <p className="border border-zinc-800 bg-black/20 p-3 text-sm text-zinc-400">
                Noch keine Einträge.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function TopRankCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Card className="rounded-[8px] border border-[#c8ff00]/30 bg-[#11120f] py-0 text-zinc-100 ring-0">
      <CardHeader className="py-5">
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="font-black text-3xl text-[#c8ff00]">
            #{entry.rank}
          </span>
          <Medal aria-hidden="true" className="text-[#c8ff00]" />
        </CardTitle>
        <CardDescription className="font-black text-xl text-zinc-100">
          {entry.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 pb-6">
        <div className="border border-zinc-800 bg-black/20 p-3">
          <p className="text-xs text-zinc-500 uppercase">Credits</p>
          <p className="mt-1 font-black font-mono text-zinc-100 tabular-nums">
            {creditFormatter.format(entry.credits)}
          </p>
        </div>
        <div className="border border-zinc-800 bg-black/20 p-3">
          <p className="text-xs text-zinc-500 uppercase">PnL</p>
          <p
            className={
              entry.pnl >= 0
                ? "mt-1 font-black font-mono text-[#c8ff00] tabular-nums"
                : "mt-1 font-black font-mono text-destructive tabular-nums"
            }
          >
            {entry.pnl > 0 ? "+" : ""}
            {creditFormatter.format(entry.pnl)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
