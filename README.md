# M324

M324 ist eine TypeScript-Monorepo-Anwendung auf Basis von Better-T-Stack. Das Projekt besteht aus einem React-Frontend, einer Hono-API und einem geteilten Datenbank-Package mit Drizzle ORM.

## Technologieüberblick

- **Frontend:** React 19, Vite, TanStack Router, Tailwind CSS 4, lokale shadcn/ui-Primitives
- **Backend:** Node.js, Hono, Better Auth, tsx für Entwicklung, tsdown für Builds
- **Datenbank:** PostgreSQL, Drizzle ORM, Drizzle Kit, Docker Compose für lokale Datenbank
- **Cloud-Datenbank:** Neon PostgreSQL für die deployte Produktionsumgebung
- **Monorepo:** npm Workspaces und Turborepo
- **Qualität:** TypeScript, Ultracite, Biome
- **Tests:** Vitest für Unit- und Integrationstests mit Testcontainers
- **CI/CD:** GitHub Actions für Qualitätschecks und Vercel Git Integration für Deployments

## Projektstruktur

```text
M324/
├── apps/
│   ├── web/                 # React/Vite-Frontend
│   │   ├── src/components/  # Wiederverwendbare UI-Komponenten
│   │   ├── src/routes/      # TanStack Router Seiten und Layouts
│   │   ├── src/lib/         # Client-Helfer, z. B. Auth und Env
│   │   └── src/styles/      # Globale Styles und Design Tokens
│   └── server/              # Hono-API
│       └── src/             # Server-Entry, Auth-Konfiguration, Env-Validierung
├── packages/
│   └── db/                  # Geteiltes Datenbank-Package
│       ├── src/schema/      # Drizzle-Schema
│       └── src/migrations/  # SQL-Migrationen
├── .github/
│   └── workflows/ci.yml     # Automatisierte CI-Pipeline
├── docker-compose.yml       # Lokale PostgreSQL-Instanz
├── turbo.json               # Task-Pipeline für das Monorepo
├── biome.jsonc              # Ultracite/Biome-Konfiguration
└── package.json             # Workspace-Skripte und Root-Abhängigkeiten
```

Die generierten Ordner `dist/`, `node_modules/` und `.turbo/` sind Build- beziehungsweise Cache-Artefakte und müssen normalerweise nicht manuell bearbeitet werden.

## Pipeline

Die Pipeline wird durch Turborepo in `turbo.json` gesteuert:

- `dev` startet persistente Entwicklungsprozesse und wird nicht gecacht.
- `build` baut zuerst abhängige Packages (`dependsOn: ["^build"]`) und schreibt Artefakte nach `dist/`.
- `check-types` führt TypeScript-Prüfungen über die Workspaces aus.
- `db:*` Tasks sind uncached, weil sie externe Datenbankzustände verändern oder beobachten.

Für Builds berücksichtigt Turbo diese Umgebungsvariablen:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CORS_ORIGIN`
- `GOOGLE_CLIENT_ID` (optional, für Google Login)
- `GOOGLE_CLIENT_SECRET` (optional, für Google Login)
- `LOKI_URL`
- `LOKI_USERNAME`
- `LOKI_PASSWORD`
- `VITE_SERVER_URL`
- `VITE_GRAFANA_URL`

Die CI-Pipeline in `.github/workflows/ci.yml` läuft bei Pull Requests sowie bei Pushes auf `main` und `preview`. Sie installiert die Abhängigkeiten mit `npm ci` und führt danach in parallelen Jobs Lint, Type-Checks, Unit Tests und einen Drizzle-Migrationscheck aus. Ein nachgelagerter `build`-Job baut alle Workspaces, und auf `main`/`preview` markiert ein finaler `deploy`-Job, dass die Vercel-Integration den Push veröffentlicht. Stale CI-Runs auf demselben Ref werden über eine Concurrency-Gruppe automatisch gecanceld.

Das Deployment läuft über die Vercel Git Integration. Commits auf `main` erzeugen Production Deployments, Pull Requests beziehungsweise Branches erzeugen Preview Deployments.

## Deployment und Environments

Das Projekt besteht aus drei deploybaren Komponenten:

- **Web-App:** `m324-web` auf Vercel, erreichbar über `https://m324-web.vercel.app`
- **API:** `m324-server` auf Vercel, erreichbar über `https://m324-server.vercel.app`
- **Datenbank:** Neon PostgreSQL als Cloud-Datenbank für die deployte Umgebung

Die Umgebungen sind so getrennt:

- **Development:** lokale `.env` Dateien, Vite/Hono über `npm run dev`, PostgreSQL über Docker Compose
- **Preview:** automatische Vercel Preview Deployments für Branches und Pull Requests
- **Production:** automatische Vercel Production Deployments von `main` mit Neon PostgreSQL über `DATABASE_URL`

Lokal wird PostgreSQL über Docker Compose gestartet. In Preview und Production zeigt `DATABASE_URL` auf Neon.

## Voraussetzungen

Installiere lokal:

- **Node.js** in einer aktuellen LTS-Version
- **npm**; das Projekt ist auf `npm@11.13.0` ausgelegt
- **Docker Desktop** oder eine kompatible Docker-Engine für PostgreSQL
- Optional: **PostgreSQL-Treiber/Clienttools** wie `psql` oder eine GUI, falls du direkt in die Datenbank schauen möchtest

Für die Anwendung selbst werden keine separaten systemweiten SDKs benötigt. Die TypeScript-, Vite-, Drizzle-, Turbo- und Ultracite-Tools werden über npm installiert.

## Lokale Einrichtung

1. Abhängigkeiten installieren:

```bash
npm install
```

2. Umgebungsvariablen konfigurieren. Die Vorlagen liegen als `.env.example` neben jeder App und können direkt kopiert werden:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

In `apps/server/.env` muss anschließend `BETTER_AUTH_SECRET` durch einen zufälligen String mit mindestens 32 Zeichen ersetzt werden. Google-Login (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) ist optional — bleiben die Felder leer, wird der Button im UI ausgeblendet. Auch Loki ist optional: ohne `LOKI_URL` skippt der Server den Push transparent.

3. PostgreSQL starten:

```bash
npm run db:start
```

Die lokale Datenbank läuft danach über Docker auf `localhost:5432` mit:

- Datenbank: `M324`
- Benutzer: `postgres`
- Passwort: `password`

4. Datenbankschema anwenden:

```bash
npm run db:push
```

5. Entwicklungsumgebung starten:

```bash
npm run dev
```

Danach sind die Dienste erreichbar unter:

- Web-App: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)
- Loki API: [http://localhost:3100/ready](http://localhost:3100/ready)
- Grafana: [http://localhost:3001](http://localhost:3001)

## Wichtige Befehle

```bash
npm run dev          # Frontend, Backend und abhängige Workspace-Tasks starten
npm run dev:web      # Nur das Frontend starten
npm run dev:server   # Nur die API starten
npm run build        # Alle Workspaces bauen
npm run test         # Unit- und Integrationstests mit Vitest ausführen
npm run check-types  # TypeScript-Prüfungen ausführen
npm run check        # Ultracite/Biome-Prüfung
npm run fix          # Automatische Ultracite/Biome-Fixes anwenden
```

## Datenbankbefehle

```bash
npm run db:start     # PostgreSQL, Loki und Grafana im Hintergrund starten
npm run db:watch     # Selbiges, aber im Vordergrund mit Live-Logs
npm run db:stop      # Container stoppen
npm run db:down      # Container und Netzwerk entfernen (Volumes bleiben)
npm run db:reset     # Container und Volumes entfernen (DB komplett wipen)
npm run db:push      # Schema direkt in die Datenbank pushen
npm run db:generate  # Drizzle-Migrationen generieren
npm run db:check     # Migrationen auf Konsistenz prüfen (auch in CI aktiv)
npm run db:migrate   # Migrationen ausführen
npm run db:seed      # Demo-Märkte und System-User in eine leere DB schreiben
npm run db:studio    # Drizzle Studio öffnen
```

## Observability

Das Repository bringt einen lokalen Observability-Stack mit:

- **Loki** sammelt strukturierte Server-Logs (Port `3100`)
- **Grafana** ist bereits mit Loki verbunden (Port `3001`, anonymous viewer)
- Ein Dashboard `M324 Server Observability` wird via Provisioning-Files in `ops/observability/grafana/` automatisch geladen
- Die App selbst zeigt das Dashboard unter [`/stats`](http://localhost:5173/stats) als eingebettetes iframe

Lokaler Ablauf (sofern `.env.example` kopiert wurde, ist `LOKI_URL` bereits gesetzt):

1. `npm run db:start` — startet Postgres, Loki und Grafana
2. `npm run db:push && npm run db:seed` — Schema anwenden und Demo-Märkte laden
3. `npm run dev` — App starten
4. `/stats` im Browser öffnen oder direkt Grafana unter [http://localhost:3001/d/m324-observability](http://localhost:3001/d/m324-observability)

Für Preview/Production: dieselbe Server-Logik kann gegen Grafana Cloud (oder einen anderen Loki-Endpoint) pushen, solange `LOKI_URL` erreichbar ist. Optional sind `LOKI_USERNAME` und `LOKI_PASSWORD` für Basic Auth, sowie `VITE_GRAFANA_URL` im Web-App-Env für den iframe-Embed.

## UI-Anpassungen

Das Frontend verwaltet seine shadcn/ui-Primitives direkt im App-Workspace:

- Design Tokens und globale Styles: `apps/web/src/styles/globals.css`
- Komponenten: `apps/web/src/components/*`
- shadcn-Konfiguration: `apps/web/components.json`

Neue Komponenten können vom Projekt-Root aus hinzugefügt werden:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c apps/web
```

Import-Beispiel:

```tsx
import { Button } from "@/components/button";
```

## Qualitätssicherung

Vor Abgabe oder Commit sollten mindestens diese Checks laufen:

```bash
npm run test
npm run check-types
npm run check
npm run build
```

Formatierung und viele Linting-Probleme lassen sich automatisch beheben:

```bash
npm run fix
```

## Zusatzleistungen

Umgesetzte Zusatzleistungen:

- **CI/CD Deployment:** Vercel deployed Web-App und API automatisch über die GitHub-Integration. `.github/workflows/ci.yml` läuft bei PRs sowie Pushes auf `main` und `preview` und teilt die Quality-Checks in parallele Jobs auf: Lint, Type-Check, Unit Tests, Drizzle-Migration-Check, Build und ein Deploy-Stage-Marker.
- **Container-Tool:** `docker-compose.yml` startet PostgreSQL, Loki und Grafana mit Healthcheck und persistierenden Volumes.
- **Pipeline Environments:** Development läuft lokal, Preview läuft über Vercel Branch-/PR-Deployments und Production über Vercel Deployments von `main`.
- **Deploybare Datenbank:** Neon PostgreSQL wird als Cloud-Datenbank für die deployte Anwendung verwendet.
- **Tests:** Vitest deckt Logging-, UI-Utility- und Auth-Redirect-Logik ab. Zusätzlich prüfen Testcontainers-Integrationstests mit PostgreSQL die zentralen Markt-Flows: Wette platzieren, fehlende Credits, pari-mutuel Resolve und Non-Admin-Resolve.
- **Applikationslogs:** Der Server erzeugt strukturierte JSON-Logs für Serverstart, Environment, Datenbank-Konfiguration, CORS, Request-Start, Request-Ende, Auth-Requests, Healthchecks, Favicon-Requests und Fehler.
- **Observability:** Loki + Grafana laufen lokal über Docker Compose mit provisionierten Datasources und Dashboards. Das Frontend bettet das Dashboard unter `/stats` ein.
- **Authentifikation:** Better Auth mit Email/Password und optionalem Google OAuth.
- **Feature Branching:** Alle Änderungen laufen über Feature-Branches und Pull Requests, der `preview`-Branch dient als Integrations-Staging vor `main`.

Noch sinnvoll als nächster Schritt:

- GitHub-Issues/PRs in der Abschlussdokumentation eindeutig referenzieren, damit die Nachverfolgbarkeit der Feature-Branches sichtbar bleibt.
