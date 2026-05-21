# M324

M324 ist eine TypeScript-Monorepo-Webapplikation für Modul 324. Die Anwendung besteht aus einem React/Vite-Frontend, einer Hono-API und einer PostgreSQL-Datenbank. Lokal läuft PostgreSQL über Docker, deployed läuft die Datenbank über Neon PostgreSQL.

## Projektstruktur

```text
M324/
├── apps/
│   ├── web/                 # React/Vite Frontend mit TanStack Router
│   └── server/              # Hono Backend mit Better Auth
├── packages/
│   └── db/                  # Drizzle Schema, Migrationen und DB-Helfer
├── ops/observability/       # Loki/Grafana Konfiguration
├── .github/workflows/ci.yml # GitHub Actions Pipeline
├── docker-compose.yml       # Lokale PostgreSQL-, Loki- und Grafana-Container
├── package.json             # Root Scripts und npm Workspaces
└── turbo.json               # Turborepo Task-Konfiguration
```

## Tech Stack

- Frontend: React 19, Vite, TanStack Router, Tailwind CSS
- Backend: Node.js, Hono, Better Auth
- Datenbank: PostgreSQL, Drizzle ORM, Drizzle Kit
- Monorepo: npm Workspaces, Turborepo
- Qualität: TypeScript, Ultracite/Biome
- Tests: Vitest, Testcontainers
- Container: Docker Compose
- Deployment: Vercel Git Integration
- Cloud-Datenbank: Neon PostgreSQL
- Observability: Loki und Grafana

## Voraussetzungen

Lokal benötigt:

- Node.js
- npm
- Docker Desktop oder kompatible Docker Engine
- Git
- Optional: PostgreSQL Client/GUI, z. B. `psql`, TablePlus oder DBeaver

Für GitHub Actions zusätzlich eingerichtet:

- Neon-Testdatenbank für Integrationstests
- `DATABASE_URL` als GitHub Actions Secret für diese Testdatenbank

## Environment Variables

Die Vorlagen liegen in:

- `apps/server/.env.example`
- `apps/web/.env.example`

Benötigte Backend-Variablen:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CORS_ORIGIN`
- optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- optional für Logs: `LOKI_URL`, `LOKI_USERNAME`, `LOKI_PASSWORD`

Benötigte Frontend-Variablen:

- `VITE_SERVER_URL`

Echte Secrets werden nicht im Repository gespeichert. Lokal werden `.env` Dateien verwendet, in Vercel sind die Environment Variables pro Umgebung eingetragen.

## Lokale Ausführung

```bash
npm install
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
npm run db:start
npm run db:push
npm run db:seed
npm run dev
```

Danach sind die Komponenten lokal erreichbar:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)
- PostgreSQL: `localhost:5432`
- Grafana: [http://localhost:3001](http://localhost:3001)
- Loki: [http://localhost:3100/ready](http://localhost:3100/ready)

## Wichtige Befehle

```bash
npm run dev              # Frontend und Backend starten
npm run dev:web          # Nur Frontend starten
npm run dev:server       # Nur Backend starten
npm run build            # Alle Workspaces bauen
npm run check            # Ultracite/Biome Check
npm run fix              # Ultracite/Biome Auto-Fix
npm run check-types      # TypeScript Checks
npm test                 # Unit Tests
npm run test:integration # Integrationstests mit Testcontainers/PostgreSQL
```

Datenbank:

```bash
npm run db:start     # PostgreSQL, Loki und Grafana starten
npm run db:stop      # Container stoppen
npm run db:down      # Container entfernen, Volumes behalten
npm run db:reset     # Container und Volumes löschen
npm run db:push      # Drizzle Schema auf DB anwenden
npm run db:generate  # Migrationen generieren
npm run db:check     # Migrationen prüfen
npm run db:migrate   # Migrationen ausführen
npm run db:seed      # Demo-Daten laden
npm run db:studio    # Drizzle Studio öffnen
```

## Deployment und Environments

Die Anwendung hat drei Komponenten:

- Frontend: [https://m324-web.vercel.app](https://m324-web.vercel.app)
- Backend: [https://m324-server.vercel.app](https://m324-server.vercel.app)
- Datenbank: Neon PostgreSQL

Environment-Trennung:

- Development: lokale `.env` Dateien und PostgreSQL über Docker
- Preview: Vercel Preview Deployment vom Branch `preview`
- Production: Vercel Production Deployment vom Branch `main`

Preview URL:

- [https://m324-web-git-preview-riciyts-projects.vercel.app](https://m324-web-git-preview-riciyts-projects.vercel.app)

Vercel enthält die Environment Variables für Production und Preview. `main` ist Production, `preview` ist Preview.

## Basisleistungen

| Basisleistung | Beschreibung aus der Bewertung | Unsere Lösung |
| --- | --- | --- |
| Drei Komponenten lokal ausführbar | Frontend, Backend und Datenbank müssen lokal startbar sein. | Frontend und Backend laufen über `npm run dev`. PostgreSQL läuft lokal über `docker-compose.yml` und wird mit `npm run db:start` gestartet. |
| Drei Komponenten deploybar und online erreichbar | Frontend, Backend und Datenbank müssen deployed beziehungsweise online erreichbar sein. | Frontend ist auf Vercel unter [https://m324-web.vercel.app](https://m324-web.vercel.app), Backend unter [https://m324-server.vercel.app](https://m324-server.vercel.app), die Datenbank läuft über Neon PostgreSQL. |
| README Dokumentation | Projektstruktur, Pipeline, Tools, nötige SDKs/Treiber, Ausführungsanleitung und kurze Erklärung der Zusatzleistungen müssen dokumentiert sein. | Diese README beschreibt Struktur, Tech Stack, Voraussetzungen, Environment Variables, lokale Ausführung, Pipeline, Deployment, Tests, Zusatzleistungen, Task-Tracking und KI-Einsatz. |

## CI/CD Pipeline

Die Pipeline liegt in `.github/workflows/ci.yml`.

GitHub Actions läuft bei Pull Requests und bei Pushes auf `main` und `preview`. Die Pipeline enthält diese Stages:

- install mit `npm ci`
- lint/format mit `npm run check`
- type check mit `npm run check-types`
- unit tests mit `npm test`
- integration tests mit `npm run db:push` und `npm run test:integration:ci` gegen die Neon-Testdatenbank aus dem GitHub Actions Secret `DATABASE_URL`
- migration check mit `npm run db:check`
- build mit `npm run build`
- deploy marker für Vercel Git Integration

Das eigentliche Deployment wird nicht manuell ausgeführt. Vercel Git Integration deployed automatisch:

- Push auf `main` -> Production
- Push auf `preview` -> Preview

## Tests

Unit Tests laufen mit:

```bash
npm test
```

Integrationstests laufen lokal mit Docker/Testcontainers und einer PostgreSQL-Testdatenbank:

```bash
npm run test:integration
```

In GitHub Actions laufen Integrationstests gegen die über `DATABASE_URL` konfigurierte Neon-Testdatenbank. Vorher wird das Schema mit `npm run db:push` auf diese Testdatenbank angewendet. Lokal sind die Integrationstests weiter über Docker/Testcontainers ausführbar.

## Zusatzleistungen

| Zusatzleistung | Beschreibung aus der Bewertung | Unsere Lösung / Umsetzung |
| --- | --- | --- |
| CI/CD Deployment mit Scripts/Workflow/YAML | Deployment soll nicht manuell sein, sondern über Scripts, Workflow oder YAML unterstützt werden. | `.github/workflows/ci.yml` führt die Quality Gates aus. Das eigentliche Deployment macht Vercel Git Integration automatisch: `main` deployed Production, `preview` deployed Preview. |
| Einsatz von Container-Tool | Ein Container-Tool wie Docker soll eingesetzt werden. | `docker-compose.yml` startet lokal PostgreSQL, Loki und Grafana mit Volumes und Healthcheck. |
| Pipeline Stages | Die Pipeline soll Stages wie lint, test, build und deploy enthalten. | GitHub Actions enthält install, lint/format, type check, unit tests, migration check, build und deploy marker. |
| 10 sinnvolle Unit Tests | Es sollen mindestens 10 sinnvolle Unit Tests vorhanden sein. | Vitest testet Logging, Loki Payloads, Auth Provider, Auth Redirects und UI Utilities. Lokal laufen 16 Unit Tests erfolgreich. |
| Integrationstests | Integrationstests sollen z. B. mit Testcontainers oder Docker umgesetzt sein. | `npm run test:integration` startet lokal PostgreSQL über Testcontainers und testet zentrale Markt-Flows. In GitHub Actions laufen die Tests mit `npm run test:integration:ci` gegen die Neon-Testdatenbank aus dem `DATABASE_URL` Secret; vorher wird das Schema mit `npm run db:push` angewendet. |
| Pipeline Environments | Es soll getrennte Umgebungen wie dev, staging/preview und production geben. | Development läuft lokal mit Docker und `.env`. Vercel nutzt `main` als Production und `preview` als Preview. Die Environment Variables sind in Vercel pro Umgebung eingetragen. |
| Task-Tracking Integration | Aufgaben sollen über ein Tool wie Jira oder GitHub Issues nachvollziehbar sein. | Task-Tracking wurde über GitHub Issues umgesetzt, z. B. Issues #10 bis #14 für Backend, API, Frontend, Tests und Observability. |
| Kubernetes | Kubernetes-Manifeste, Helm Charts oder vergleichbare Konfiguration. | Nicht umgesetzt, weil der Aufwand für die wenigen Zusatzpunkte nicht sinnvoll war. |
| Observe Tools | Observability-Tools wie Grafana, Loki oder ähnliche sollen eingesetzt werden. | Docker Compose startet Loki und Grafana. Der Server schreibt strukturierte Logs und Grafana visualisiert sie lokal. |
| 10 sinnvolle Logs in der Applikation | Die Applikation soll mindestens 10 sinnvolle Logs an relevanten Stellen haben. | Der Server loggt unter anderem Environment, DB-Konfiguration, CORS, Request Start/Ende, Auth Requests, Healthchecks, Favicon-Requests, Fehler und Serverstart. |
| Authentifikation | Die Applikation soll Authentifikation berücksichtigen. | Better Auth wird für Email/Password und optional Google OAuth verwendet. Backend-Middlewares schützen angemeldete API-Flows und Admin-Aktionen. |
| Feature Branching | Es soll nicht direkt auf `main` gearbeitet werden, sondern mit Feature Branches und Pull Requests. | Features wurden über Branches, Pull Requests und den `preview` Branch integriert. `main` ist Production. |

## Task-Tracking

Task-Tracking wurde über GitHub Issues umgesetzt. Beispiele:

- Issue #10: Backend-Grundlage
- Issue #11: API-Logik
- Issue #12: Frontend Markets UI
- Issue #13: Integrationstests
- Issue #14: Observability

Die Features wurden über Branches und Pull Requests umgesetzt und anschließend in `preview` integriert.

## Authentifikation

Die Authentifikation läuft über Better Auth. Unterstützt werden Email/Password und optional Google OAuth. Serverseitig schützen Middlewares angemeldete API-Flows und Admin-Aktionen.

## Observability und Logs

Docker Compose startet lokal Loki und Grafana. Der Server schreibt strukturierte JSON-Logs unter anderem für:

- Serverstart
- Environment-Konfiguration
- Datenbank-Konfiguration
- CORS-Konfiguration
- Request Start/Ende
- Auth Requests
- Healthchecks
- Fehler

Grafana ist lokal unter [http://localhost:3001](http://localhost:3001) erreichbar.

## KI-Einsatz

KI wurde im Projekt als Unterstützung verwendet, nicht als ungeprüfte Quelle. Eingesetzt wurde sie vor allem für:

- technische Reviews gegen die Bewertungskriterien
- Strukturierung und Kürzung der README
- Debugging von Linting-, Test-, Git- und CI-Problemen
- Verbesserungsvorschläge zu Deployment, Tests und Sicherheit

Positive Erfahrungen waren, dass Lücken in README, Pipeline und Bewertungskriterien schneller sichtbar wurden. Auch Fehler wie fehlende Formatierung oder unklare Test-Setups konnten schneller eingegrenzt werden.

Problematisch war, dass KI teilweise mit allgemeinen oder veralteten Informationen gearbeitet hat. Gerade bei modernen Tools wie Vercel, Neon, Better Auth, GitHub Actions kann sich der aktuelle Stand schnell ändern. Deshalb mussten Aussagen der KI immer mit dem Repository, offiziellen Tool-Ausgaben oder echten Deployments abgeglichen werden.

Für unser Projekt war besonders wichtig:

- Externe Zustände wie Vercel Environment Variables, GitHub Actions Secrets und die Neon-Testdatenbank waren für die KI nicht automatisch sichtbar.
- Die KI musste korrigiert werden, als sich der Stand der Integrationstests geändert hat: zuerst lokal mit Docker, später zusätzlich in GitHub Actions mit Neon-Testdatenbank.
- Die erste README-Version war zu lang und zu allgemein. Sie musste auf die konkreten Bewertungskriterien reduziert werden.
- Der KI muss man die gewünschte Richtung klar vorgeben. Wenn die Aufgabe zu offen gestellt ist, schlägt sie schnell allgemeine Tools, generische Lösungen oder unnötige Zusatzfunktionen vor.
- Für grössere Aufgaben ist ein separater Chat sinnvoll. Zu viel alter Kontext kann verloren gehen oder sogar kontraproduktiv werden, wenn frühere Annahmen nicht mehr zum aktuellen Stand passen.
- Am besten funktioniert es, zuerst in einem separaten Chat die Vorstellung eines Features oder einer Änderung zu klären und zu verfeinern. Danach kann man die konkrete Aufgabe in einem neuen Chat mit klarer Anweisung umsetzen lassen.
- Man muss selbst wissen, was man erreichen will. Nur dann kann man die Anforderungen präzise genug formulieren, damit die KI wirklich hilfreiche Ergebnisse liefert.
- KI-Ausgaben wurden erst übernommen, nachdem `npm run check`, Tests, Build, Git-Diff und die CI-/Deployment-Situation geprüft wurden.
