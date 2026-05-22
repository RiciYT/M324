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
import { MarketPoolChart } from "@/components/market-pool-chart";
import type { Market } from "@/lib/api-client";
import { useFormattedDate } from "@/lib/use-formatted-date";

const creditFormatter = new Intl.NumberFormat("de-CH");
const dateFormatter = new Intl.DateTimeFormat("de-CH", {
  dateStyle: "medium",
});
const percentFormatter = new Intl.NumberFormat("de-CH", {
  maximumFractionDigits: 0,
  style: "percent",
});

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const totalPool = market.yesPool + market.noPool;
  const yesRatio = totalPool === 0 ? 0.5 : market.yesPool / totalPool;
  const statusLabel = market.status === "open" ? "Offen" : "Aufgelöst";
  const noRatio = 1 - yesRatio;
  const closesAt = useFormattedDate(market.closesAt, dateFormatter);

  return (
    <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0 transition-colors hover:border-zinc-700">
      <CardHeader className="py-5">
        <CardTitle className="font-semibold text-lg text-wrap-balance leading-tight">
          {market.title}
        </CardTitle>
        <CardDescription className="text-zinc-400 leading-6">
          {market.description}
        </CardDescription>
        <CardAction>
          <span className="border border-zinc-700 px-2 py-1 font-bold text-[10px] text-zinc-400 uppercase">
            {statusLabel}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-5">
        <div className="grid grid-cols-2 gap-2">
          <PriceButton
            label="Ja"
            tone="yes"
            value={percentFormatter.format(yesRatio)}
          />
          <PriceButton
            label="Nein"
            tone="no"
            value={percentFormatter.format(noRatio)}
          />
        </div>

        <MarketPoolChart
          className="h-24"
          noPool={market.noPool}
          yesPool={market.yesPool}
        />
      </CardContent>
      <CardFooter className="justify-between gap-3 border-zinc-800 border-t py-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" />
            {closesAt}
          </span>
          <span className="inline-flex items-center gap-1">
            <Scale aria-hidden="true" />
            {creditFormatter.format(totalPool)} Coins
          </span>
        </div>
        <Link
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[6px] border border-zinc-700 px-3 font-black text-xs uppercase hover:bg-zinc-900"
          params={{ marketid: market.id }}
          to="/markets/$marketid"
        >
          Öffnen
          <ArrowRight aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function PriceButton({
  label,
  value,
  tone = "no",
}: {
  label: string;
  value: string;
  tone?: "yes" | "no";
}) {
  const className =
    tone === "yes"
      ? "border-[#c8ff00]/30 bg-[#c8ff00]/10 text-[#c8ff00]"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  return (
    <div
      className={`flex items-center justify-between rounded-[6px] border px-3 py-2 ${className}`}
    >
      <span className="font-semibold text-sm">{label}</span>
      <span className="font-mono font-semibold text-sm tabular-nums">
        {value}
      </span>
    </div>
  );
}
