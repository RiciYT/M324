import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { createDb } from "./index";
import { user } from "./schema/auth";
import { market } from "./schema/markets";

const SYSTEM_USER_ID = "system";

interface SeedMarket {
  daysUntilClose: number;
  description: string;
  title: string;
}

const seedMarkets: SeedMarket[] = [
  {
    title: "Wird die Mensa nächste Woche wieder Pizza haben?",
    description:
      "Pizza war letzte Woche der heimliche Star. Schafft sie das Comeback?",
    daysUntilClose: 7,
  },
  {
    title:
      "Schafft die ITB2c-Klasse die M324-Präsentation ohne Live-Demo-Crash?",
    description:
      "Murphy's Law trifft auf Vercel-Cold-Start. YES wenn alles klappt.",
    daysUntilClose: 21,
  },
  {
    title:
      "Wird OpenAI vor Anthropic ein neues Flagship-Modell veröffentlichen?",
    description: "GPT-6 vs Claude 5 — wer drückt zuerst auf den Launch-Knopf?",
    daysUntilClose: 60,
  },
  {
    title: "Bleibt 'Skibidi Toilet' bis Ende 2026 ein Meme?",
    description: "Internet-Halbwertszeit ist kurz. Überlebt das Meme das Jahr?",
    daysUntilClose: 90,
  },
  {
    title: "Wird das nächste Apple Event mehr als 5x das Wort 'AI' enthalten?",
    description: "Cupertinos AI-Hype-Counter. Live im Stream mitzählen.",
    daysUntilClose: 45,
  },
  {
    title: "Wird Bitcoin in den nächsten 30 Tagen über 100k stehen?",
    description: "Stichtag ist der Schlusskurs am Ablaufdatum.",
    daysUntilClose: 30,
  },
  {
    title: "Gewinnt YB die nächste Super-League-Saison?",
    description: "Bern oder St. Gallen oder doch Basel?",
    daysUntilClose: 75,
  },
  {
    title: "Veröffentlicht Vercel 2026 wieder neue Free-Tier-Limits?",
    description: "Der jährliche Schreckmoment für Hobby-Devs.",
    daysUntilClose: 90,
  },
  {
    title: "Friert die SBB nächste Woche Frostpläne wegen Schneechaos ein?",
    description: "Die jährliche Frage — Winter vs. Pünktlichkeit.",
    daysUntilClose: 7,
  },
  {
    title: "Wird Grafana noch dieses Jahr ein neues Major-Release machen?",
    description: "Major = neue Hauptversionsnummer auf grafana.com/blog.",
    daysUntilClose: 60,
  },
  {
    title: "Schafft Mathias seine IPA mit Note ≥ 5?",
    description:
      "Smart Ticket Helper auf der Zielgeraden — gemeinsame Daumen-Drück-Aktion.",
    daysUntilClose: 14,
  },
  {
    title: "Wird der M324-Lehrer in der Präsentation 'pingelig' sagen?",
    description: "Klassiker-Insider. Mindestens 1x = YES.",
    daysUntilClose: 21,
  },
];

async function ensureSystemUser(db: ReturnType<typeof createDb>) {
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, SYSTEM_USER_ID));

  if (existing.length > 0) {
    return;
  }

  await db.insert(user).values({
    id: SYSTEM_USER_ID,
    name: "System",
    email: "system@m324.local",
    emailVerified: true,
    credits: 0,
    role: "system",
  });
}

async function seed() {
  const db = createDb();

  await ensureSystemUser(db);

  const existingMarkets = await db.select({ id: market.id }).from(market);
  if (existingMarkets.length > 0) {
    console.info(
      JSON.stringify({
        event: "seed.skipped",
        reason: "markets already present",
        count: existingMarkets.length,
      })
    );
    return;
  }

  const now = Date.now();
  const rows = seedMarkets.map((m) => ({
    id: randomUUID(),
    title: m.title,
    description: m.description,
    createdBy: SYSTEM_USER_ID,
    status: "open",
    closesAt: new Date(now + m.daysUntilClose * 24 * 60 * 60 * 1000),
  }));

  await db.insert(market).values(rows);

  console.info(
    JSON.stringify({
      event: "seed.completed",
      marketCount: rows.length,
    })
  );
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      JSON.stringify({
        event: "seed.failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      })
    );
    process.exit(1);
  });
