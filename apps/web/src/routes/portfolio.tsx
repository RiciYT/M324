import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, ReceiptText, WalletCards } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { usePortfolio, useWallet } from "@/lib/market-hooks";

const creditFormatter = new Intl.NumberFormat("de-CH");
const dateFormatter = new Intl.DateTimeFormat("de-CH", {
  dateStyle: "medium",
});

export const Route = createFileRoute("/portfolio")({
  component: PortfolioRoute,
});

function PortfolioRoute() {
  const { data, error, isLoading } = usePortfolio();
  const {
    data: wallet,
    error: walletError,
    isLoading: walletLoading,
  } = useWallet();
  const invested =
    data?.positions.reduce((sum, position) => sum + position.amount, 0) ?? 0;
  const pnl =
    data?.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    ) ?? 0;

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto grid max-w-[1540px] gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-14">
        <div className="lg:col-span-2">
          <div className="border-[#20231b] border-b pb-6">
            <h1 className="font-black text-4xl uppercase tracking-normal">
              Portfolio
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400 leading-6">
              Wallet, offene Positionen und alle Coin-Bewegungen an einem Ort.
            </p>
          </div>
        </div>

        <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0 lg:col-span-2">
          <CardContent className="grid gap-px bg-zinc-800 p-0 sm:grid-cols-3">
            <SummaryCell
              label="Wallet"
              value={getWalletValue({
                credits: wallet?.credits,
                error: walletError,
                isLoading: walletLoading,
              })}
            />
            <SummaryCell
              label="Investiert"
              value={`${creditFormatter.format(invested)} Coins`}
            />
            <SummaryCell
              label="Netto-Bewegung"
              tone={pnl >= 0 ? "positive" : "negative"}
              value={`${pnl > 0 ? "+" : ""}${creditFormatter.format(pnl)}`}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
          <CardHeader className="py-5">
            <CardTitle className="flex items-center gap-2 font-black text-xl uppercase">
              <WalletCards aria-hidden="true" className="text-[#c8ff00]" />
              Positionen
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Offene Wetten nach Markt und Seite.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6">
            {isLoading ? (
              <p className="text-sm text-zinc-400">Portfolio wird geladen...</p>
            ) : null}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {data?.positions.map((position) => (
              <Link
                className="grid gap-2 border border-zinc-800 bg-black/20 p-3 text-sm hover:bg-zinc-900 sm:grid-cols-[1fr_auto]"
                key={`${position.marketId}-${position.side}`}
                params={{ marketid: position.marketId }}
                to="/markets/$marketid"
              >
                <span className="font-semibold text-zinc-200">
                  {position.marketTitle}
                </span>
                <span className="font-mono text-zinc-400 tabular-nums">
                  {position.side === "yes" ? "Ja" : "Nein"} ·{" "}
                  {creditFormatter.format(position.amount)} Coins
                </span>
              </Link>
            ))}
            {!(isLoading || error) && data?.positions.length === 0 ? (
              <p className="border border-zinc-800 bg-black/20 p-3 text-sm text-zinc-400">
                Noch keine offenen Positionen.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
          <CardHeader className="py-5">
            <CardTitle className="flex items-center gap-2 font-black text-xl uppercase">
              <ReceiptText aria-hidden="true" className="text-[#c8ff00]" />
              Transaktionen
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Coin-Bewegungen aus Wetten, Auszahlungen und Boni.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6">
            {data?.transactions.map((transaction) => (
              <div
                className="grid gap-2 border border-zinc-800 bg-black/20 p-3 text-sm sm:grid-cols-[1fr_auto]"
                key={transaction.id}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold text-zinc-200">
                    {transaction.marketTitle ??
                      getTransactionReasonLabel(transaction.reason)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {dateFormatter.format(new Date(transaction.createdAt))}
                  </span>
                </div>
                <span
                  className={
                    transaction.amount >= 0
                      ? "font-black font-mono text-[#c8ff00] tabular-nums"
                      : "font-black font-mono text-destructive tabular-nums"
                  }
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {creditFormatter.format(transaction.amount)}
                </span>
              </div>
            ))}
            {!(isLoading || error) && data?.transactions.length === 0 ? (
              <p className="border border-zinc-800 bg-black/20 p-3 text-sm text-zinc-400">
                Noch keine Transaktionen.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function SummaryCell({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "neutral" | "positive" | "negative";
  value: string;
}) {
  let valueClassName = "text-zinc-100";

  if (tone === "positive") {
    valueClassName = "text-[#c8ff00]";
  }

  if (tone === "negative") {
    valueClassName = "text-destructive";
  }

  return (
    <div className="bg-[#050604] p-4">
      <p className="flex items-center gap-2 text-xs text-zinc-500 uppercase">
        <Coins aria-hidden="true" className="size-4" />
        {label}
      </p>
      <p
        className={`mt-2 font-black font-mono text-2xl tabular-nums ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

function getWalletValue({
  credits,
  error,
  isLoading,
}: {
  credits?: number;
  error?: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return "... Coins";
  }

  if (error) {
    return "- Coins";
  }

  return `${creditFormatter.format(credits ?? 0)} Coins`;
}

function getTransactionReasonLabel(reason: string) {
  if (reason === "signup_bonus") {
    return "Startbonus";
  }

  if (reason === "payout") {
    return "Auszahlung";
  }

  return "Wette";
}
