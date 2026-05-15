import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { usePortfolio } from "@/lib/market-hooks";

const creditFormatter = new Intl.NumberFormat("de-CH");

export const Route = createFileRoute("/portfolio")({
  component: PortfolioRoute,
});

function PortfolioRoute() {
  const { data, error, isLoading } = usePortfolio();

  return (
    <main className="min-h-0 overflow-y-auto">
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Positions</CardTitle>
            <CardDescription>Your open mock positions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : null}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {data?.positions.map((position) => (
              <Link
                className="grid gap-2 border border-border p-3 text-sm hover:bg-muted sm:grid-cols-[1fr_auto]"
                key={`${position.marketId}-${position.side}`}
                params={{ marketid: position.marketId }}
                to="/markets/$marketid"
              >
                <span>{position.marketTitle}</span>
                <span className="text-muted-foreground">
                  {position.side.toUpperCase()} ·{" "}
                  {creditFormatter.format(position.amount)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Credit changes from mock activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data?.transactions.map((transaction) => (
              <div
                className="flex items-center justify-between border border-border p-3 text-sm"
                key={transaction.id}
              >
                <span>{transaction.marketTitle ?? transaction.reason}</span>
                <span className="text-muted-foreground">
                  {creditFormatter.format(transaction.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
