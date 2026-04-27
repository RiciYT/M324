# M324

M324 ist eine TypeScript-Monorepo-Anwendung auf Basis von Better-T-Stack. Das Projekt besteht aus einem React-Frontend, einer Hono-API und einem geteilten Datenbank-Package mit Drizzle ORM.

## Technologieüberblick

- **Frontend:** React 19, Vite, TanStack Router, Tailwind CSS 4, lokale shadcn/ui-Primitives
- **Backend:** Node.js, Hono, Better Auth, tsx für Entwicklung, tsdown für Builds
- **Datenbank:** PostgreSQL, Drizzle ORM, Drizzle Kit, Docker Compose für lokale Datenbank
- **Cloud-Datenbank:** Neon PostgreSQL für die deployte Produktionsumgebung
- **Monorepo:** npm Workspaces und Turborepo
- **Qualität:** TypeScript, Ultracite, Biome
- **Tests:** Vitest für Unit Tests
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
- `VITE_SERVER_URL`

Die CI-Pipeline in `.github/workflows/ci.yml` läuft bei Pushes auf `main` und bei Pull Requests. Sie installiert die Abhängigkeiten mit `npm ci` und führt danach Unit Tests, Ultracite/Biome-Checks, TypeScript-Checks und den Workspace-Build aus.

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

2. Umgebungsvariablen konfigurieren:

`apps/server/.env`

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/M324
BETTER_AUTH_SECRET=ersetze-diesen-wert-durch-einen-langen-zufaelligen-string
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

`apps/web/.env`

```env
VITE_SERVER_URL=http://localhost:3000
```

`BETTER_AUTH_SECRET` muss mindestens 32 Zeichen lang sein.

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

## Wichtige Befehle

```bash
npm run dev          # Frontend, Backend und abhängige Workspace-Tasks starten
npm run dev:web      # Nur das Frontend starten
npm run dev:server   # Nur die API starten
npm run build        # Alle Workspaces bauen
npm run test         # Unit Tests mit Vitest ausführen
npm run check-types  # TypeScript-Prüfungen ausführen
npm run check        # Ultracite/Biome-Prüfung
npm run fix          # Automatische Ultracite/Biome-Fixes anwenden
```

## Datenbankbefehle

```bash
npm run db:start     # PostgreSQL im Hintergrund starten
npm run db:watch     # PostgreSQL im Vordergrund starten
npm run db:stop      # Container stoppen
npm run db:down      # Container und Netzwerk entfernen
npm run db:push      # Schema direkt in die Datenbank pushen
npm run db:generate  # Drizzle-Migrationen generieren
npm run db:migrate   # Migrationen ausführen
npm run db:studio    # Drizzle Studio öffnen
```

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

- **CI/CD Deployment:** Vercel deployed Web-App und API automatisch über die GitHub-Integration. Zusätzlich prüft `.github/workflows/ci.yml` jeden Push auf `main` und Pull Requests.
- **Container-Tool:** `docker-compose.yml` startet eine lokale PostgreSQL-Datenbank mit Healthcheck und persistierendem Volume.
- **Pipeline Environments:** Development läuft lokal, Preview läuft über Vercel Branch-/PR-Deployments und Production über Vercel Deployments von `main`.
- **Deploybare Datenbank:** Neon PostgreSQL wird als Cloud-Datenbank für die deployte Anwendung verwendet.
- **Unit Tests:** Vitest deckt aktuell 10 sinnvolle Unit Tests für Logging und UI-Utility-Verhalten ab.
- **Applikationslogs:** Der Server erzeugt strukturierte JSON-Logs für Serverstart, Environment, Datenbank-Konfiguration, CORS, Request-Start, Request-Ende, Auth-Requests, Healthchecks, Favicon-Requests und Fehler.

Noch sinnvoll als nächster Schritt:

- Integrationstests gegen API und Testdatenbank ergänzen.
- Observability mit Grafana/Loki oder einem vergleichbaren Stack auf die strukturierten Logs aufsetzen.
