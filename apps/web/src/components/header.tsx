import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

import { BalanceBadge } from "./balance-badge";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/", label: "Home" },
    { to: "/markets", label: "Markets" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/leaderboard", label: "Leaderboard" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? <BalanceBadge /> : null}
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
