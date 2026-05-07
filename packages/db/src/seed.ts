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
    title: "Hält Rockstar den 19.11.2026 für GTA 6 ohne dritte Verschiebung?",
    description:
      "Bereits zweimal verschoben. YES wenn das Spiel genau am 19.11. live geht.",
    daysUntilClose: 196,
  },
  {
    title: "Wird Sam Altman 2026 nochmal kurzzeitig aus OpenAI gefeuert?",
    description:
      "Reenactment der November-2023-Saga. Jede dokumentierte Entlassung zählt.",
    daysUntilClose: 238,
  },
  {
    title:
      "Sagt Jensen Huang in der nächsten Nvidia-Keynote das Wort 'AI' mehr als 100 Mal?",
    description:
      "Live im Stream mitzählen. Slides zählen nicht — nur Gesprochenes.",
    daysUntilClose: 60,
  },
  {
    title: "Erreicht Rust 2026 zum ersten Mal die TIOBE-Top-10?",
    description:
      "Aktueller Stand: stagniert um Platz 13. Dezember-Ranking ist Stichtag.",
    daysUntilClose: 238,
  },
  {
    title:
      "Veröffentlicht OpenAI 2026 ein wirklich offenes Modell unter Apache-2.0 oder MIT?",
    description:
      "'Open weights' zählen NICHT. Es muss eine echte Open-Source-Lizenz sein.",
    daysUntilClose: 238,
  },
  {
    title: "Erscheint Half-Life 3 vor GTA 6?",
    description:
      "Der Klassiker. Stichtag ist der GTA-6-Release. Wir alle wissen die Antwort.",
    daysUntilClose: 196,
  },
  {
    title:
      "Erscheint das 'Sea of Sorrow'-DLC für Hollow Knight: Silksong noch 2026?",
    description:
      "Team Cherry und Termine — eine Liebesgeschichte. YES wenn DLC live geht.",
    daysUntilClose: 238,
  },
  {
    title:
      "Bekommt The Elder Scrolls VI 2026 endlich ein Release-Datum-Fenster?",
    description:
      "Quartal oder Monat reicht. 'Sometime in the future' zählt nicht als Fenster.",
    daysUntilClose: 238,
  },
  {
    title:
      "Verkauft GTA 6 in den ersten 24 Stunden für mehr als 1 Milliarde Dollar?",
    description:
      "GTA 5 hatte 800M$. Schafft die Fortsetzung den 9-stelligen Bonus-Schritt?",
    daysUntilClose: 197,
  },
  {
    title: "Bekommt CS2 2026 einen offiziellen Battle-Royale-Modus?",
    description:
      "Valve hat es nie offiziell ausgeschlossen — und nie bestätigt. Klassiker.",
    daysUntilClose: 238,
  },
  {
    title: "Wird Steam Deck 2 von Valve offiziell angekündigt bis 31.12.2026?",
    description:
      "Ankündigung reicht — Release-Datum nicht nötig. Roadmap-Folie zählt.",
    daysUntilClose: 238,
  },
  {
    title:
      "Halten Avengers: Doomsday UND Dune: Messiah ihren 'Dunesday'-Release am 18.12.2026?",
    description:
      "Der Mega-Clash. YES nur wenn BEIDE Filme exakt am 18.12. starten.",
    daysUntilClose: 225,
  },
  {
    title: "Erscheint der Solo Leveling Movie noch in 2026?",
    description:
      "Production Committee plant 'late 2026', Arbeit war im Q1 noch nicht gestartet.",
    daysUntilClose: 238,
  },
  {
    title:
      "Erreicht Linux 2026 erstmals mehr als 5 % Desktop-Marktanteil laut StatCounter?",
    description:
      "Year of the Linux Desktop, dieses Mal aber wirklich. Dezember-Snapshot zählt.",
    daysUntilClose: 238,
  },
  {
    title: "Schafft Mathias seine IPA mit Note ≥ 5?",
    description:
      "Smart Ticket Helper auf der Zielgeraden — gemeinsame Daumen-Drück-Aktion.",
    daysUntilClose: 14,
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
