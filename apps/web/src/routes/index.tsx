import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  GitBranch,
  Server,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const stackItems = [
  {
    title: "React Frontend",
    description: "Vite, TanStack Router und Tailwind CSS 4 für schnelle Views.",
    icon: GitBranch,
  },
  {
    title: "Hono API",
    description: "Schlanke Server-Routen mit Better Auth als Login-Basis.",
    icon: Server,
  },
  {
    title: "Drizzle Datenbank",
    description:
      "Geteiltes Schema, Migrationen und PostgreSQL über Workspaces.",
    icon: Database,
  },
] as const;

const workflowItems = [
  "Lokale Entwicklung mit Turbo starten",
  "Auth und API gegen die Server-App testen",
  "Datenbankschema mit Drizzle versionieren",
  "Qualität mit Ultracite, Vitest und TypeScript sichern",
] as const;

function HomeComponent() {
  return (
    <main className="min-h-0 overflow-y-auto bg-background">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
        <div className="flex min-w-0 flex-col justify-center">
          <p className="mb-4 text-muted-foreground text-sm">
            M324 Starter Workspace
          </p>
          <h1 className="max-w-3xl text-balance font-semibold text-4xl tracking-normal sm:text-5xl">
            Eine saubere Basis für Web, API und Datenbank.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base text-muted-foreground leading-7">
            Dieses Projekt ist ein TypeScript-Monorepo mit React-Frontend,
            Hono-Server, Better Auth und Drizzle. Die neue Startseite zeigt
            sofort, wohin man als Entwickler oder Tester gehen soll.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 bg-primary px-4 font-medium text-primary-foreground text-sm transition-[background-color,scale] duration-150 hover:bg-primary/90 active:scale-[0.96]"
              to="/dashboard"
            >
              Dashboard öffnen
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center border border-border px-4 font-medium text-sm transition-[background-color,scale] duration-150 hover:bg-muted active:scale-[0.96]"
              to="/login"
            >
              Account erstellen
            </Link>
          </div>
        </div>

        <aside className="grid content-start gap-4 border-border border-t pt-6 lg:border-t-0 lg:border-l lg:pl-8">
          <div>
            <h2 className="font-medium text-lg">Projektzustand</h2>
            <p className="mt-2 text-muted-foreground text-sm leading-6">
              Die Kernteile sind getrennt, buildbar und bereit für weitere
              Features.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border text-sm">
            <div className="bg-card p-4">
              <dt className="text-muted-foreground">Apps</dt>
              <dd className="mt-2 font-medium text-2xl tabular-nums">2</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="text-muted-foreground">Packages</dt>
              <dd className="mt-2 font-medium text-2xl tabular-nums">1</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="text-muted-foreground">Runtime</dt>
              <dd className="mt-2 font-medium">Node</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="text-muted-foreground">Checks</dt>
              <dd className="mt-2 font-medium">CI ready</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="border-border border-t">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {stackItems.map(({ title, description, icon: Icon }) => (
            <article
              className="border border-border bg-card p-5 text-card-foreground"
              key={title}
            >
              <Icon
                aria-hidden="true"
                className="mb-5 size-5 text-muted-foreground"
                strokeWidth={1.8}
              />
              <h2 className="font-medium text-base">{title}</h2>
              <p className="mt-2 text-muted-foreground text-sm leading-6">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-border border-t">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className="font-medium text-2xl tracking-normal">
              Der nächste sinnvolle Schritt
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground text-sm leading-6">
              Nutze diese Seite als Startpunkt für Demo, Entwicklung und
              Projektabgabe. Alles Wichtige ist erreichbar, ohne dass man erst
              im Repository suchen muss.
            </p>
          </div>

          <div className="divide-y divide-border border border-border bg-card">
            {workflowItems.map((item) => (
              <div className="flex items-start gap-3 p-4" key={item}>
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.8}
                />
                <p className="text-sm leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-border border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              strokeWidth={1.8}
            />
            <p className="max-w-2xl text-muted-foreground text-sm leading-6">
              Qualitätschecks laufen über Ultracite, TypeScript, Vitest und den
              Turborepo-Build.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 border border-border px-4 font-medium text-sm transition-[background-color,scale] duration-150 hover:bg-muted active:scale-[0.96]"
            to="/dashboard"
          >
            Weiterarbeiten
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
