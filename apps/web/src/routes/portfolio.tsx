import { createFileRoute, Link } from "@tanstack/react-router";
import { usePortfolio, useWallet } from "@/lib/market-hooks";
import { useFormattedDate } from "@/lib/use-formatted-date";

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
      <section className="mx-auto grid max-w-[1180px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:px-10">
        <div className="lg:col-span-2">
          <div className="border-[#20231b] border-b pb-6">
            <h1 className="font-semibold text-4xl tracking-normal">
              Portfolio
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400 leading-6">
              Wallet, offene Positionen und Coin-Bewegungen.
            </p>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-[8px] border border-zinc-800 bg-zinc-800 sm:grid-cols-3 lg:col-span-2">
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
            label="Netto"
            tone={pnl >= 0 ? "positive" : "negative"}
            value={`${pnl > 0 ? "+" : ""}${creditFormatter.format(pnl)}`}
          />
        </div>

        <section aria-labelledby="positions-heading">
          <div className="mb-4">
            <h2 className="font-semibold text-xl" id="positions-heading">
              Positionen
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Offene Wetten nach Markt und Seite.
            </p>
          </div>
          <div className="divide-y divide-zinc-800 border-zinc-800 border-y">
            {isLoading ? (
              <p className="py-3 text-sm text-zinc-400">
                Portfolio wird geladen…
              </p>
            ) : null}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {data?.positions.map((position) => (
              <Link
                className="grid gap-2 py-3 text-sm hover:bg-zinc-900 sm:grid-cols-[1fr_auto]"
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
              <p className="py-3 text-sm text-zinc-400">
                Noch keine offenen Positionen.
              </p>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="transactions-heading">
          <div className="mb-4">
            <h2 className="font-semibold text-xl" id="transactions-heading">
              Transaktionen
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Wetten, Auszahlungen und Boni.
            </p>
          </div>
          <div className="divide-y divide-zinc-800 border-zinc-800 border-y">
            {data?.transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
            {!(isLoading || error) && data?.transactions.length === 0 ? (
              <p className="py-3 text-sm text-zinc-400">
                Noch keine Transaktionen.
              </p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: {
    amount: number;
    createdAt: string;
    id: string;
    marketTitle?: string | null;
    reason: string;
  };
}) {
  const createdAt = useFormattedDate(transaction.createdAt, dateFormatter);

  return (
    <div className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_auto]">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-semibold text-zinc-200">
          {transaction.marketTitle ??
            getTransactionReasonLabel(transaction.reason)}
        </span>
        <span className="text-xs text-zinc-500">{createdAt}</span>
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
      <p className="text-xs text-zinc-500">{label}</p>
      <p
        className={`mt-2 font-mono font-semibold text-2xl tabular-nums ${valueClassName}`}
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
    return "… Coins";
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
