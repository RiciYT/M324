import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { BetForm } from "@/components/bet-form";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { useMarket } from "@/lib/market-hooks";

const creditFormatter = new Intl.NumberFormat("de-CH");
const dateFormatter = new Intl.DateTimeFormat("de-CH", {
  dateStyle: "full",
});

export const Route = createFileRoute("/markets/$marketid")({
  component: MarketDetailRoute,
});

function MarketDetailRoute() {
  const { marketid } = Route.useParams();
  const { data: market, error, isLoading } = useMarket(marketid);

  if (isLoading) {
    return (
      <main className="p-8 text-muted-foreground text-sm">
        Loading market...
      </main>
    );
  }

  if (error || !market) {
    return <main className="p-8 text-destructive text-sm">{error}</main>;
  }

  const totalPool = market.yesPool + market.noPool;

  return (
    <main className="min-h-0 overflow-y-auto">
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{market.title}</CardTitle>
              <CardDescription>{market.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Metric
                label="YES Pool"
                value={creditFormatter.format(market.yesPool)}
              />
              <Metric
                label="NO Pool"
                value={creditFormatter.format(market.noPool)}
              />
              <Metric
                label="Total Pool"
                value={creditFormatter.format(totalPool)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>
                Mock activity until the API branch provides real bet records.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ActivityLine amount="+120 YES" name="Shezi" />
              <ActivityLine amount="+80 NO" name="Imad" />
              <ActivityLine amount="+200 YES" name="Rici" />
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Place Bet</CardTitle>
              <CardDescription>
                Closes {dateFormatter.format(new Date(market.closesAt))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BetForm marketId={market.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>
                Visible in mock mode so the resolve flow can be designed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline">
                <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                YES
              </Button>
              <Button variant="outline">
                <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                NO
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-2 font-medium text-lg">{value}</p>
    </div>
  );
}

function ActivityLine({ amount, name }: { amount: string; name: string }) {
  return (
    <div className="flex items-center justify-between border border-border p-3 text-sm">
      <span>{name}</span>
      <span className="text-muted-foreground">{amount}</span>
    </div>
  );
}
