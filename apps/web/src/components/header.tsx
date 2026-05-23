import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";
import { apiClient, type Wallet } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { useWallet } from "@/lib/market-hooks";
import { marketQueryKeys } from "@/lib/query-client";

const coinFormatter = new Intl.NumberFormat("de-CH");
const navigationLinks = [
  { to: "/", label: "Startseite" },
  { to: "/markets", label: "Märkte" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/leaderboard", label: "Bestenliste" },
] as const;

export default function Header() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const { data: wallet, error, isLoading } = useWallet(isSignedIn);
  const [claimError, setClaimError] = useState<string>();
  const [isClaiming, setIsClaiming] = useState(false);
  const currentWallet = wallet;

  return (
    <header className="sticky top-0 z-20 border-[#1d2117] border-b bg-[#050604] text-zinc-100">
      <div className="mx-auto flex min-h-16 max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link className="min-w-0 font-semibold text-lg tracking-normal" to="/">
          <span className="text-[#c8ff00]">Shit</span>Market
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-zinc-400 xl:flex">
          {navigationLinks.map(({ to, label }) => (
            <Link
              className="transition-colors hover:text-[#c8ff00]"
              key={to}
              to={to}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MobileNavigation />
          {isSignedIn ? (
            <span className="hidden font-mono text-sm text-zinc-400 tabular-nums sm:inline">
              {getWalletLabel({
                credits: currentWallet?.credits,
                error,
                isLoading,
              })}
            </span>
          ) : null}
          {isSignedIn ? (
            <Button
              className="hidden bg-[#c8ff00] text-black hover:bg-[#b7eb00] sm:inline-flex"
              disabled={
                isClaiming || isLoading || !currentWallet?.canClaimDailyCoins
              }
              onClick={async () => {
                setClaimError(undefined);
                setIsClaiming(true);

                try {
                  const claimedWallet = await apiClient.claimDailyCoins();
                  queryClient.setQueryData(
                    marketQueryKeys.wallet(session?.user.id),
                    claimedWallet
                  );
                  await Promise.all([
                    queryClient.invalidateQueries({
                      queryKey: marketQueryKeys.portfolio(),
                    }),
                    queryClient.invalidateQueries({
                      queryKey: marketQueryKeys.leaderboard,
                    }),
                  ]);
                } catch (error) {
                  setClaimError(
                    error instanceof Error
                      ? error.message
                      : "Coins konnten nicht abgeholt werden"
                  );
                } finally {
                  setIsClaiming(false);
                }
              }}
              title={getClaimTitle({
                error: claimError,
                isClaiming,
                wallet: currentWallet,
              })}
              variant="default"
            >
              {getClaimLabel({ isClaiming, wallet: currentWallet })}
            </Button>
          ) : null}
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function MobileNavigation() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button className="xl:hidden" size="icon" variant="outline" />}
      >
        <MenuIcon aria-hidden="true" />
        <span className="sr-only">Navigation öffnen</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#11120f] xl:hidden">
        {navigationLinks.map(({ to, label }) => (
          <DropdownMenuItem key={to} render={<Link to={to} />}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getWalletLabel({
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

  return `${coinFormatter.format(credits ?? 0)} Coins`;
}

function getClaimLabel({
  isClaiming,
  wallet,
}: {
  isClaiming: boolean;
  wallet?: Wallet;
}) {
  if (isClaiming) {
    return "Wird geholt…";
  }

  if (wallet?.canClaimDailyCoins) {
    return "1000 Coins holen";
  }

  return "Morgen wieder";
}

function getClaimTitle({
  error,
  isClaiming,
  wallet,
}: {
  error?: string;
  isClaiming: boolean;
  wallet?: Wallet;
}) {
  if (error) {
    return error;
  }

  if (isClaiming) {
    return "Coins werden gutgeschrieben";
  }

  if (wallet?.canClaimDailyCoins) {
    return "1000 Coins deinem Wallet gutschreiben";
  }

  if (wallet?.nextDailyClaimAt) {
    return `Wieder verfügbar ab ${new Date(
      wallet.nextDailyClaimAt
    ).toLocaleString("de-CH")}`;
  }

  return "Daily Coins sind aktuell nicht verfügbar";
}
