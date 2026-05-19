import { createFileRoute } from "@tanstack/react-router";
import { Activity, BarChart3, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { env } from "@/lib/env";

export const Route = createFileRoute("/stats")({
  component: StatsRoute,
});

function StatsRoute() {
  const grafanaUrl = env.VITE_GRAFANA_URL;

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto grid max-w-[1540px] gap-5 px-5 py-8 sm:px-8 lg:px-14">
        <div className="border-[#20231b] border-b pb-6">
          <h1 className="font-black text-4xl uppercase tracking-normal">
            Statistik
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400 leading-6">
            Live-Dashboard aus Grafana, gefüttert von strukturierten Server-Logs
            über Loki. Zeigt Request-Volumen, Fehlerraten und Event-Verteilung
            in Echtzeit.
          </p>
        </div>

        {grafanaUrl ? (
          <Card className="overflow-hidden rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-zinc-800 border-b px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-[8px] bg-[#c8ff00] text-black">
                  <Activity aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle className="font-black text-base uppercase tracking-normal">
                    Server Observability
                  </CardTitle>
                  <CardDescription className="text-sm text-zinc-400">
                    Loki-Backed Grafana Dashboard, auto-refresh alle 30 s.
                  </CardDescription>
                </div>
              </div>
              <a
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-[#c8ff00]"
                href={grafanaUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                In Grafana öffnen
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <iframe
                className="h-[800px] w-full border-0 bg-[#0b0c08]"
                src={grafanaUrl}
                title="M324 Server Observability"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
            <CardHeader className="px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-[8px] bg-zinc-800 text-zinc-300">
                  <BarChart3 aria-hidden="true" className="size-5" />
                </span>
                <CardTitle className="font-black text-base uppercase tracking-normal">
                  Dashboard nicht konfiguriert
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6 text-sm text-zinc-400 leading-6">
              <p>
                In diesem Environment ist <code>VITE_GRAFANA_URL</code> nicht
                gesetzt. Lokal startet der Observability-Stack mit:
              </p>
              <pre className="overflow-x-auto rounded-[6px] border border-zinc-800 bg-[#0b0c08] p-3 font-mono text-xs text-zinc-300">
                npm run db:start
              </pre>
              <p>
                Danach läuft Grafana unter <code>http://localhost:3001</code>{" "}
                und das Dashboard ist über die <code>VITE_GRAFANA_URL</code>
                -Variable in <code>apps/web/.env</code> erreichbar. Siehe{" "}
                <code>.env.example</code> für ein vorgefertigtes Snippet.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
