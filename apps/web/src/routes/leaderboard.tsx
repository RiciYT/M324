import { createFileRoute } from "@tanstack/react-router";
import { useLeaderboard } from "@/lib/market-hooks";

const creditFormatter = new Intl.NumberFormat("de-CH");

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardRoute,
});

function LeaderboardRoute() {
  const { data: leaderboard, error, isLoading } = useLeaderboard();
  const entries = leaderboard ?? [];

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
          <div className="overflow-x-auto border-zinc-800 border-y">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-zinc-800 border-b">
                  <th className="w-20 py-3 pr-4 font-medium">Rang</th>
                  <th className="py-3 pr-4 font-medium">Nutzer</th>
                  <th className="py-3 pr-4 text-right font-medium">Credits</th>
                  <th className="py-3 text-right font-medium">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {entries.map((entry) => (
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
        ) : null}
      </section>
    </main>
  );
}
