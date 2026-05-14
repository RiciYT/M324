import { WalletCards } from "lucide-react";
import { useWallet } from "@/lib/market-hooks";

const numberFormatter = new Intl.NumberFormat("de-CH");

export function BalanceBadge() {
  const { data, isLoading } = useWallet();

  return (
    <div className="inline-flex h-8 items-center gap-2 border border-border bg-card px-2.5 font-medium text-xs">
      <WalletCards aria-hidden="true" />
      <span>
        {isLoading
          ? "..."
          : `${numberFormatter.format(data?.credits ?? 0)} Credits`}
      </span>
    </div>
  );
}
