import type { MarketStatus } from "@/lib/api-client";

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

export type EffectiveMarketStatus = MarketStatus | "expired";

export function getEffectiveMarketStatus({
  closesAt,
  now = new Date(),
  status,
}: {
  closesAt: string;
  now?: Date;
  status: MarketStatus;
}): EffectiveMarketStatus {
  if (status !== "open") {
    return status;
  }

  return new Date(closesAt).getTime() <= now.getTime() ? "expired" : "open";
}

export function formatMarketTimeRemaining({
  closesAt,
  now = new Date(),
}: {
  closesAt: string;
  now?: Date;
}): string {
  const remainingMs = new Date(closesAt).getTime() - now.getTime();

  if (remainingMs <= 0) {
    return "Abgelaufen";
  }

  const days = Math.floor(remainingMs / DAY_IN_MS);
  const hours = Math.floor((remainingMs % DAY_IN_MS) / HOUR_IN_MS);
  const minutes = Math.floor((remainingMs % HOUR_IN_MS) / MINUTE_IN_MS);

  if (days > 0) {
    return `${days}T ${hours}Std ${minutes}Min`;
  }

  if (hours > 0) {
    return `${hours}Std ${minutes}Min`;
  }

  if (minutes > 0) {
    return `${minutes}Min`;
  }

  return `${Math.ceil(remainingMs / SECOND_IN_MS)}Sek`;
}

export function getEffectiveMarketStatusLabel(
  status: EffectiveMarketStatus
): string {
  if (status === "resolved") {
    return "Aufgelöst";
  }

  if (status === "expired") {
    return "Abgelaufen";
  }

  return "Offen";
}
