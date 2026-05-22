import { Link } from "@tanstack/react-router";
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
    <article className="grid gap-4 border-zinc-800 border-t py-5 text-zinc-100 transition-colors hover:border-zinc-700 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span>{statusLabel}</span>
          <span>{closesAt}</span>
          <span>{creditFormatter.format(totalPool)} Coins</span>
        </div>
        <h2 className="font-semibold text-lg text-wrap-balance leading-tight">
          {market.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400 leading-6">
          {market.description}
        </p>
      </div>

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

      <Link
        className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#526800]/60 px-3 text-[#526800] text-sm transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-[#526800]/10 active:scale-[0.96] lg:w-24 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        params={{ marketid: market.id }}
        to="/markets/$marketid"
      >
        Öffnen
      </Link>
    </article>
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
      className={`flex min-h-10 items-center justify-between rounded-[6px] border px-3 py-2 ${className}`}
    >
      <span className="font-semibold text-sm">{label}</span>
      <span className="font-mono font-semibold text-sm tabular-nums">
        {value}
      </span>
    </div>
  );
}
