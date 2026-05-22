import { useGSAP } from "@gsap/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import type { LeaderboardEntry, Market } from "@/lib/api-client";
import { useLeaderboard, useMarkets } from "@/lib/market-hooks";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const coinFormatter = new Intl.NumberFormat("de-CH");
const percentFormatter = new Intl.NumberFormat("de-CH", {
  maximumFractionDigits: 0,
  style: "percent",
});
const marketSkeletonKeys = [
  "market-skeleton-one",
  "market-skeleton-two",
  "market-skeleton-three",
  "market-skeleton-four",
] as const;
const imageAssets = {
  ballots: "/images/shitmarket-ballots.jpg",
  coins: "/images/shitmarket-coins.jpg",
  crowd: "/images/shitmarket-crowd.jpg",
  floor: "/images/shitmarket-floor.jpg",
  hero: "/images/shitmarket-hero-wide.jpg",
  rumorWall: "/images/shitmarket-rumor-wall.jpg",
  terminal: "/images/shitmarket-terminal.jpg",
} as const;
const revealWords =
  "ShitMarket nimmt die Mechanik ernst und den Markt nicht. Du setzt Coins auf Fragen, die niemand finanzieren sollte, aber alle diskutieren.".split(
    " "
  );

function HomeComponent() {
  const pageRef = useRef<HTMLElement>(null);
  const {
    data: markets,
    error: marketsError,
    isLoading: marketsLoading,
  } = useMarkets();
  const {
    data: leaderboard,
    error: leaderboardError,
    isLoading: leaderboardLoading,
  } = useLeaderboard();
  const featuredMarkets = markets?.slice(0, 4) ?? [];
  const activeMarkets =
    markets?.filter((market) => market.status === "open") ?? [];
  const totalPool =
    markets?.reduce((sum, market) => sum + getTotalPool(market), 0) ?? 0;
  const topUsers = leaderboard?.slice(0, 4) ?? [];

  useGSAP(
    () => {
      gsap.fromTo(
        ".hero-copy > *",
        { opacity: 0, y: 28 },
        {
          duration: 0.9,
          ease: "power3.out",
          opacity: 1,
          stagger: 0.12,
          y: 0,
        }
      );

      gsap.fromTo(
        ".reveal-word",
        { opacity: 0.42 },
        {
          ease: "none",
          opacity: 1,
          scrollTrigger: {
            end: "bottom center",
            scrub: 0.8,
            start: "top 72%",
            trigger: ".scrub-copy",
          },
          stagger: 0.045,
        }
      );

      for (const item of gsap.utils.toArray<HTMLElement>(".motion-media")) {
        gsap.fromTo(
          item,
          { opacity: 0.76, scale: 0.97 },
          {
            ease: "none",
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              end: "bottom 24%",
              scrub: true,
              start: "top 86%",
              trigger: item,
            },
          }
        );
      }
    },
    { scope: pageRef }
  );

  return (
    <main
      className="min-h-0 w-full max-w-full overflow-y-auto overflow-x-hidden bg-[#050604] text-zinc-100"
      ref={pageRef}
    >
      <section className="relative isolate overflow-hidden border-[#20231b] border-b">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-center bg-cover opacity-60 contrast-125 grayscale"
          style={{
            backgroundImage: `url(${imageAssets.hero})`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,244,239,0.04)_0%,rgba(244,244,239,0.82)_68%,#f4f4ef_100%)] dark:bg-[linear-gradient(180deg,rgba(5,6,4,0.12)_0%,rgba(5,6,4,0.74)_58%,#050604_100%)]"
        />

        <div className="hero-copy relative mx-auto flex min-h-[calc(76svh-4rem)] max-w-[1320px] flex-col items-center justify-center px-5 py-16 text-center sm:px-8 lg:px-10">
          <h1 className="max-w-6xl text-balance font-semibold text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-normal">
            Polymarket, aber für Quatsch.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-200 leading-7 md:text-xl">
            Setze Coins auf absurde Prognosen, sieh die Quote kippen und gewinn
            wenigstens die Diskussion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 bg-[#c8ff00] px-6 text-black hover:bg-[#b7eb00]"
              render={<Link to="/markets" />}
            >
              Märkte ansehen
            </Button>
            <Button
              className="h-12 border-zinc-500 bg-black/35 px-6 text-zinc-100 hover:bg-black/55"
              render={<Link to="/markets/new" />}
              variant="outline"
            >
              Eigene Frage stellen
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:py-20 lg:px-10">
        <div className="mb-8 max-w-4xl">
          <h2 className="font-semibold text-4xl leading-tight md:text-6xl">
            Ein Markt für alles, was zu dumm für echte Finanzen ist.
          </h2>
          <p className="mt-5 max-w-2xl text-zinc-400 leading-7">
            Die App bleibt nah am Prognosemarkt: Frage, Pool, Quote, Wallet,
            Rangliste. Der Inhalt ist die Parodie.
          </p>
        </div>

        <div className="grid grid-flow-dense gap-4 lg:auto-rows-[minmax(220px,auto)] lg:grid-cols-6">
          <ProductPreview
            activeCount={activeMarkets.length}
            className="lg:col-span-4 lg:row-span-2"
            error={marketsError}
            isLoading={marketsLoading}
            marketCount={markets?.length ?? 0}
            markets={featuredMarkets}
            totalPool={totalPool}
          />

          <LeaderboardPanel
            error={leaderboardError}
            isLoading={leaderboardLoading}
            users={topUsers}
          />

          <RulePanel />
        </div>
      </section>

      <section className="border-[#20231b] border-y">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-semibold text-4xl leading-tight md:text-6xl">
              Die Quote ist ernst. Die Frage nicht.
            </h2>
            <p className="scrub-copy mt-8 max-w-xl text-2xl text-zinc-300 leading-[1.35] md:text-3xl">
              {revealWords.map((word) => (
                <span className="reveal-word inline-block pr-2" key={word}>
                  {word}
                </span>
              ))}
            </p>
          </div>

          <ParodyAccordions />
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <h2 className="font-semibold text-4xl leading-tight md:text-6xl">
              Kommentare wie ein Trading Floor, nur schlechter informiert.
            </h2>
          </div>
          <QuoteCarousel />
        </div>
      </section>

      <section className="border-[#20231b] border-t">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <h2 className="font-semibold text-4xl leading-tight md:text-6xl">
              Such dir einen Markt. Oder bau den nächsten Unsinn.
            </h2>
            <p className="mt-5 max-w-xl text-zinc-400 leading-7">
              ShitMarket ist schnell genug für Prognosen und ehrlich genug für
              eine Parodie.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 bg-[#c8ff00] px-6 text-black hover:bg-[#b7eb00]"
              render={<Link to="/markets" />}
            >
              Alle Märkte
            </Button>
            <Button
              className="h-12 border-zinc-700 px-6"
              render={<Link to="/leaderboard" />}
              variant="outline"
            >
              Rangliste
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductPreview({
  activeCount,
  className,
  error,
  isLoading,
  marketCount,
  markets,
  totalPool,
}: {
  activeCount: number;
  className?: string;
  error?: string;
  isLoading: boolean;
  marketCount: number;
  markets: Market[];
  totalPool: number;
}) {
  return (
    <aside
      aria-label="Marktvorschau"
      className={`motion-media overflow-hidden rounded-[8px] border border-zinc-800 bg-[#11120f] shadow-[0_1px_0_rgba(255,255,255,0.04)] ${className ?? ""}`}
    >
      <div className="grid grid-cols-3 border-zinc-800 border-b text-sm">
        <PreviewMetric label="Offen" value={activeCount} />
        <PreviewMetric label="Märkte" value={marketCount} />
        <PreviewMetric label="Pool" value={coinFormatter.format(totalPool)} />
      </div>
      <div className="divide-y divide-zinc-800">
        {isLoading ? <MarketSkeletons /> : null}
        {error ? (
          <ErrorNotice message="Märkte konnten nicht geladen werden." />
        ) : null}
        {markets.map((market) => (
          <MarketPreviewLink key={market.id} market={market} />
        ))}
      </div>
    </aside>
  );
}

function PreviewMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-mono font-semibold text-zinc-100 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function MarketPreviewLink({ market }: { market: Market }) {
  return (
    <Link
      className="grid cursor-pointer gap-3 p-4 text-sm transition-[background-color,color] duration-150 ease-out hover:bg-zinc-900/70 focus-visible:bg-zinc-900/70 sm:grid-cols-[1fr_auto_auto] sm:items-center"
      params={{ marketid: market.id }}
      to="/markets/$marketid"
    >
      <span className="min-w-0 font-medium text-zinc-100">{market.title}</span>
      <span className="font-mono text-[#c8ff00] tabular-nums">
        Ja {getSidePrice(market, "yes")}
      </span>
      <span className="font-mono text-zinc-400 tabular-nums">
        {coinFormatter.format(getTotalPool(market))} Coins
      </span>
    </Link>
  );
}

function MarketSkeletons() {
  return marketSkeletonKeys.map((key) => (
    <div className="p-4" key={key}>
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="mt-3 h-4 w-2/3" />
    </div>
  ));
}

function LeaderboardPanel({
  error,
  isLoading,
  users,
}: {
  error?: string;
  isLoading: boolean;
  users: LeaderboardEntry[];
}) {
  return (
    <section className="motion-media overflow-hidden rounded-[8px] border border-zinc-800 bg-[#11120f] p-5 shadow-[0_1px_0_rgba(255,255,255,0.04)] lg:col-span-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold text-2xl">Rangliste</h2>
          <p className="mt-1 text-sm text-zinc-500">Wer den Quatsch gewinnt.</p>
        </div>
        <Link
          className="inline-flex h-9 items-center rounded-[6px] border border-zinc-700 px-3 text-sm text-zinc-200 transition-[background-color,border-color,color] duration-150 ease-out hover:border-[#c8ff00]/60 hover:bg-zinc-900 hover:text-[#c8ff00]"
          to="/leaderboard"
        >
          Alle
        </Link>
      </div>
      <LeaderboardPreview error={error} isLoading={isLoading} users={users} />
    </section>
  );
}

function RulePanel() {
  return (
    <section className="motion-media overflow-hidden rounded-[8px] border border-zinc-800 bg-[#11120f] shadow-[0_1px_0_rgba(255,255,255,0.04)] lg:col-span-2">
      <div
        aria-hidden="true"
        className="h-28 bg-center bg-cover contrast-125 grayscale"
        style={{
          backgroundImage: `url(${imageAssets.coins})`,
        }}
      />
      <div className="p-5">
        <h2 className="font-semibold text-2xl">
          Keine Token. Keine Orakel. Nur Coins.
        </h2>
        <p className="mt-3 text-sm text-zinc-400 leading-6">
          Der Markt entscheidet über Pool-Verteilung. Die Pointe entscheidet die
          Community.
        </p>
      </div>
    </section>
  );
}

function ParodyAccordions() {
  const items = [
    {
      body: "GTA 6, CEO-Gerüchte, Schulpausen-Ökonomie. Alles wird handelbar, nichts wird seriös.",
      image: imageAssets.ballots,
      title: "Absurde Fragen",
    },
    {
      body: "Ja und Nein bleiben sichtbar. Die Mechanik ist klar, damit der Witz nicht die Bedienung erklären muss.",
      image: imageAssets.terminal,
      title: "Echte Quoten",
    },
    {
      body: "Wallet, Positionen und Rangliste machen aus Meinung ein kleines Risiko.",
      image: imageAssets.rumorWall,
      title: "Coins statt Geld",
    },
  ] as const;

  return (
    <div className="flex min-h-[520px] flex-col gap-3 md:flex-row">
      {items.map((item) => (
        <article
          className="motion-media flex min-h-[170px] flex-1 overflow-hidden rounded-[8px] border border-zinc-800 bg-[#11120f] shadow-[0_1px_0_rgba(255,255,255,0.04)] md:min-h-0"
          key={item.title}
        >
          <div
            aria-hidden="true"
            className="min-w-24 bg-center bg-cover contrast-125 grayscale md:min-w-32"
            style={{
              backgroundImage: `url(${item.image})`,
            }}
          />
          <div className="flex min-w-0 flex-col justify-end p-5">
            <h3 className="text-balance font-semibold text-2xl">
              {item.title}
            </h3>
            <p className="mt-3 max-w-sm text-sm text-zinc-400 leading-6">
              {item.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function QuoteCarousel() {
  const quotes = [
    {
      image: imageAssets.crowd,
      name: "Matt",
      text: "Ich wollte nur abstimmen. Jetzt verteidige ich eine GTA-These mit 1'000 Coins.",
    },
    {
      image: imageAssets.coins,
      name: "Ricardo",
      text: "Fühlt sich wie Trading an, nur dass alle wissen, dass es Quatsch ist.",
    },
    {
      image: imageAssets.floor,
      name: "Imad",
      text: "Die Rangliste macht aus schlechten Vorhersagen wenigstens gute Unterhaltung.",
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {quotes.map((quote) => (
        <figure
          className="motion-media overflow-hidden rounded-[8px] border border-zinc-800 bg-[#11120f] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          key={quote.name}
        >
          <div className="h-48 overflow-hidden">
            <div
              aria-hidden="true"
              className="h-full bg-center bg-cover contrast-125 grayscale"
              style={{
                backgroundImage: `url(${quote.image})`,
              }}
            />
          </div>
          <figcaption className="p-5">
            <p className="text-lg leading-7">{quote.text}</p>
            <p className="mt-4 font-mono text-[#c8ff00] text-sm">
              {quote.name}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function LeaderboardPreview({
  error,
  isLoading,
  users,
}: {
  error?: string;
  isLoading: boolean;
  users: LeaderboardEntry[];
}) {
  if (isLoading) {
    return (
      <div className="mt-5 divide-y divide-zinc-800 border-zinc-800 border-y">
        <Skeleton className="my-3 h-5 w-full" />
        <Skeleton className="my-3 h-5 w-5/6" />
        <Skeleton className="my-3 h-5 w-4/6" />
      </div>
    );
  }

  if (error) {
    return <ErrorNotice className="mt-5" message={error} />;
  }

  return (
    <ol className="mt-5 divide-y divide-zinc-800 border-zinc-800 border-y">
      {users.map((user) => (
        <li
          className="grid grid-cols-[34px_1fr_auto] items-center gap-3 py-3 text-sm"
          key={user.name}
        >
          <span className="font-mono text-zinc-500">{user.rank}</span>
          <span className="font-medium text-zinc-300">{user.name}</span>
          <span className="font-mono font-semibold text-[#c8ff00] tabular-nums">
            {formatLeaderboardProfit(user)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ErrorNotice({
  className = "",
  message,
}: {
  className?: string;
  message: string;
}) {
  return (
    <p
      className={`border-zinc-800 border-t bg-black/20 p-4 text-destructive text-sm ${className}`}
    >
      {message}
    </p>
  );
}

function getTotalPool(market: Market) {
  return market.yesPool + market.noPool;
}

function getSidePrice(market: Market, side: "yes" | "no") {
  const totalPool = getTotalPool(market);

  if (totalPool === 0) {
    return percentFormatter.format(0.5);
  }

  const yesShare = market.yesPool / totalPool;
  const value = side === "yes" ? yesShare : 1 - yesShare;

  return percentFormatter.format(value);
}

function formatLeaderboardProfit(user: LeaderboardEntry) {
  const sign = user.pnl > 0 ? "+" : "";

  return `${sign}${coinFormatter.format(user.pnl)}`;
}
