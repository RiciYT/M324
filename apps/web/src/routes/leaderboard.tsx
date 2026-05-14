import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { useLeaderboard } from "@/lib/market-hooks";

const creditFormatter = new Intl.NumberFormat("de-CH");

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardRoute,
});

function LeaderboardRoute() {
  const { data: leaderboard, error, isLoading } = useLeaderboard();

  return (
    <main className="min-h-0 overflow-y-auto">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border border-b pb-6">
          <h1 className="font-semibold text-3xl">Leaderboard</h1>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            Mock ranking by credit balance and profit/loss.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Traders</CardTitle>
            <CardDescription>
              Demo data until wallet API is available.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : null}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {leaderboard?.map((entry) => (
              <div
                className="grid grid-cols-[48px_1fr_auto_auto] items-center gap-3 border border-border p-3 text-sm"
                key={entry.rank}
              >
                <span className="text-muted-foreground">#{entry.rank}</span>
                <span className="font-medium">{entry.name}</span>
                <span>{creditFormatter.format(entry.credits)}</span>
                <span className="text-muted-foreground">
                  {entry.pnl > 0 ? "+" : ""}
                  {creditFormatter.format(entry.pnl)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
