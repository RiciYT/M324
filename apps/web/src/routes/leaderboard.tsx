import { createFileRoute } from "@tanstack/react-router";
import type { LeaderboardEntry } from "@/lib/api-client";
import { useLeaderboard } from "@/lib/market-hooks";
import { cn } from "@/lib/utils";

const creditFormatter = new Intl.NumberFormat("de-CH");

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardRoute,
});

// react-doctor-disable-next-line react-doctor/only-export-components
function LeaderboardRoute() {
  const { data: leaderboard, error, isLoading } = useLeaderboard();
  const entries = leaderboard ?? [];
  const podiumEntries = entries.slice(0, 3);
  const tableEntries = entries.slice(3);

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto flex max-w-[980px] flex-col gap-6 px-5 py-8 sm:px-8 lg:px-10">
        <div className="border-[#20231b] border-b pb-6">
          <h1 className="font-semibold text-4xl tracking-normal">
            Bestenliste
          </h1>
          <p className="mt-2 text-sm text-zinc-400 leading-6">
            Ranking nach Coins und Gewinn oder Verlust.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-zinc-400">Bestenliste wird geladen…</p>
        ) : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {!(isLoading || error) && entries.length === 0 ? (
          <p className="border-zinc-800 border-y py-4 text-sm text-zinc-400">
            Noch keine Einträge.
          </p>
        ) : null}

        {entries.length > 0 ? (
          <div className="flex flex-col gap-6">
            {/* Podium */}
            <div className="mx-auto grid w-full max-w-4xl items-end gap-6 px-2 py-4 sm:grid-cols-3">
              {/* 2nd Place (Left side on desktop, 2nd on mobile) */}
              {podiumEntries[1] ? (
                <PodiumCard
                  badge="🥈"
                  entry={podiumEntries[1]}
                  rank={2}
                  ringColor="border-zinc-400"
                />
              ) : null}

              {/* 1st Place (Center on desktop, 1st on mobile) */}
              {podiumEntries[0] ? (
                <PodiumCard
                  badge="🥇"
                  entry={podiumEntries[0]}
                  isFirst
                  rank={1}
                  ringColor="border-[#c8ff00] shadow-[#c8ff00]/10"
                />
              ) : null}

              {/* 3rd Place (Right side on desktop, 3rd on mobile) */}
              {podiumEntries[2] ? (
                <PodiumCard
                  badge="🥉"
                  entry={podiumEntries[2]}
                  rank={3}
                  ringColor="border-amber-700"
                />
              ) : null}
            </div>

            {/* Table for ranks #4 and beyond */}
            {tableEntries.length > 0 ? (
              <div className="mt-6">
                <h2 className="mb-4 font-semibold text-xl text-zinc-200">
                  Weitere Platzierungen
                </h2>
                <div className="overflow-x-auto border-zinc-800 border-y">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="text-zinc-500">
                      <tr className="border-zinc-800 border-b">
                        <th className="w-20 py-3 pr-4 font-medium">Rang</th>
                        <th className="py-3 pr-4 font-medium">Nutzer</th>
                        <th className="py-3 pr-4 text-right font-medium">
                          Credits
                        </th>
                        <th className="py-3 text-right font-medium">PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {tableEntries.map((entry) => (
                        <tr key={entry.rank}>
                          <td className="py-3 pr-4 font-mono text-zinc-500">
                            #{entry.rank}
                          </td>
                          <td className="py-3 pr-4 font-medium text-zinc-200">
                            {entry.name}
                          </td>
                          <td className="py-3 pr-4 text-right font-mono text-zinc-300 tabular-nums">
                            {creditFormatter.format(entry.credits)}
                          </td>
                          <td
                            className={
                              entry.pnl >= 0
                                ? "py-3 text-right font-mono font-semibold text-[#c8ff00] tabular-nums"
                                : "py-3 text-right font-mono font-semibold text-destructive tabular-nums"
                            }
                          >
                            {entry.pnl > 0 ? "+" : ""}
                            {creditFormatter.format(entry.pnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

// react-doctor-disable-next-line react-doctor/only-export-components
function PodiumCard({
  entry,
  rank,
  badge,
  ringColor,
  isFirst = false,
}: {
  entry: LeaderboardEntry;
  rank: number;
  badge: string;
  ringColor: string;
  isFirst?: boolean;
}) {
  const initials = entry.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profitSign = entry.pnl > 0 ? "+" : "";

  const orderClasses: Record<number, string> = {
    1: "order-1 sm:order-2",
    2: "order-2 sm:order-1",
    3: "order-3 sm:order-3",
  };
  const orderClass = orderClasses[rank] ?? "order-last";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center rounded-[8px] border bg-[#11120f] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#c8ff00]/40 hover:shadow-[0_8px_30px_rgba(200,255,0,0.06)]",
        isFirst
          ? "border-[#c8ff00] py-8 shadow-[0_4px_20px_rgba(200,255,0,0.15)]"
          : "border-zinc-800 shadow-[0_4px_10px_rgba(0,0,0,0.3)]",
        orderClass
      )}
    >
      <div className="absolute top-4 right-4 select-none text-2xl">{badge}</div>
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full border-2 bg-zinc-900 font-bold text-zinc-100 shadow-md",
          ringColor
        )}
      >
        <span className="text-lg tracking-wide">{initials}</span>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold text-lg text-zinc-200">{entry.name}</h3>
        <p className="mt-0.5 font-medium text-xs text-zinc-500">Rang #{rank}</p>
      </div>
      <div className="mt-4 w-full border-zinc-800/60 border-t pt-3">
        <p className="font-mono text-sm text-zinc-300 tabular-nums">
          {creditFormatter.format(entry.credits)} Coins
        </p>
        <p
          className={cn(
            "mt-1 font-mono font-semibold text-xs tabular-nums",
            entry.pnl >= 0 ? "text-[#c8ff00]" : "text-destructive"
          )}
        >
          {profitSign}
          {creditFormatter.format(entry.pnl)} PnL
        </p>
      </div>
    </div>
  );
}
