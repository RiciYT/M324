import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Scale } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import type { Market } from "@/lib/api-client";

const creditFormatter = new Intl.NumberFormat("de-CH");
const dateFormatter = new Intl.DateTimeFormat("de-CH", {
  dateStyle: "medium",
});

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const totalPool = market.yesPool + market.noPool;
  const yesShare =
    totalPool === 0 ? 50 : Math.round((market.yesPool / totalPool) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{market.title}</CardTitle>
        <CardDescription>{market.description}</CardDescription>
        <CardAction>
          <span className="border border-border px-2 py-1 text-muted-foreground text-xs">
            {market.status}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border">
          <div className="bg-background p-3">
            <p className="text-muted-foreground text-xs">YES Pool</p>
            <p className="mt-1 font-medium text-sm">
              {creditFormatter.format(market.yesPool)}
            </p>
          </div>
          <div className="bg-background p-3">
            <p className="text-muted-foreground text-xs">NO Pool</p>
            <p className="mt-1 font-medium text-sm">
              {creditFormatter.format(market.noPool)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${yesShare}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>YES {yesShare}%</span>
            <span>NO {100 - yesShare}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" />
            {dateFormatter.format(new Date(market.closesAt))}
          </span>
          <span className="inline-flex items-center gap-1">
            <Scale aria-hidden="true" />
            {creditFormatter.format(totalPool)} total
          </span>
        </div>
        <Link
          className="inline-flex h-8 items-center justify-center gap-1.5 border border-border px-2.5 font-medium text-xs hover:bg-muted"
          params={{ marketid: market.id }}
          to="/markets/$marketid"
        >
          Open
          <ArrowRight aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
