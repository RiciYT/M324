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
  const yesShare = Math.round(yesRatio * 100);
  const statusLabel = market.status === "open" ? "Offen" : "Aufgeloest";

  return (
    <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
      <CardHeader className="py-5">
        <CardTitle className="font-black text-lg text-wrap-balance leading-tight">
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
        <div className="grid grid-cols-[1fr_1px_1fr] items-stretch gap-3">
          <PoolStat
            label="Ja"
            pool={market.yesPool}
            ratio={yesRatio}
            tone="yes"
          />
          <div className="bg-zinc-800" />
          <PoolStat label="Nein" pool={market.noPool} ratio={1 - yesRatio} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden border border-zinc-800 bg-black">
            <div
              className="h-full bg-[#c8ff00]"
              style={{ width: `${yesShare}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-xs text-zinc-500 tabular-nums">
            <span>Ja {yesShare}%</span>
            <span>Nein {100 - yesShare}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-zinc-800 border-t py-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" />
            {dateFormatter.format(new Date(market.closesAt))}
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
          Oeffnen
          <ArrowRight aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function PoolStat({
  label,
  pool,
  ratio,
  tone = "no",
}: {
  label: string;
  pool: number;
  ratio: number;
  tone?: "yes" | "no";
}) {
  const valueClassName = tone === "yes" ? "text-[#c8ff00]" : "text-destructive";

  return (
    <div className="border border-zinc-800 bg-black/25 p-3">
      <p className="text-xs text-zinc-500 uppercase">{label}</p>
      <p className={`mt-1 font-black font-mono text-2xl ${valueClassName}`}>
        {percentFormatter.format(ratio)}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-500 tabular-nums">
        {creditFormatter.format(pool)} Coins
      </p>
    </div>
  );
}
