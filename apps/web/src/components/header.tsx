import { Link } from "@tanstack/react-router";
import { Coins, Flame, Gift } from "lucide-react";
import { Button } from "@/components/button";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";
import { useWallet } from "@/lib/market-hooks";

const coinFormatter = new Intl.NumberFormat("de-CH");

export default function Header() {
  const { data: wallet, error, isLoading } = useWallet();
  const links = [
    { to: "/", label: "Startseite" },
    { to: "/markets", label: "Märkte" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/leaderboard", label: "Bestenliste" },
  ] as const;

  return (
    <header className="sticky top-0 z-20 border-[#1d2117] border-b bg-[#050604] text-zinc-100">
      <div className="mx-auto flex min-h-[70px] max-w-[1540px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-14">
        <Link className="flex min-w-0 items-center gap-3" to="/">
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[#c8ff00] text-black sm:size-11">
            <Flame aria-hidden="true" className="size-6 fill-black sm:size-7" />
          </span>
          <span className="leading-none">
            <span className="block font-black text-xl uppercase tracking-normal sm:text-2xl">
              <span className="text-[#c8ff00]">Shit</span>Market
            </span>
            <span className="hidden font-bold text-[11px] text-zinc-500 uppercase tracking-[0.22em] sm:block">
              Wette auf das Dümmste
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 font-black text-xs uppercase tracking-normal lg:flex">
          {links.map(({ to, label }) => (
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
          <div className="hidden items-center gap-3 sm:flex">
            <Coins aria-hidden="true" className="size-5 text-zinc-500" />
            <div className="leading-none">
              <span className="block font-bold text-[11px] text-zinc-500 uppercase">
                Wallet
              </span>
              <span className="font-black font-mono text-[#c8ff00]">
                {getWalletLabel({ credits: wallet?.credits, error, isLoading })}
              </span>
            </div>
          </div>
          <Button className="hidden sm:inline-flex" disabled>
            <Gift aria-hidden="true" data-icon="inline-start" />
            Coins claimen
          </Button>
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
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
    return "... Coins";
  }

  if (error) {
    return "- Coins";
  }

  return `${coinFormatter.format(credits ?? 0)} Coins`;
}
