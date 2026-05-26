import { describe, expect, it } from "vitest";
import {
  formatMarketTimeRemaining,
  getEffectiveMarketStatus,
} from "@/lib/market-status";

describe("getEffectiveMarketStatus", () => {
  it("marks open markets with past close dates as expired", () => {
    expect(
      getEffectiveMarketStatus({
        closesAt: "2026-05-26T09:59:59.000Z",
        now: new Date("2026-05-26T10:00:00.000Z"),
        status: "open",
      })
    ).toBe("expired");
  });

  it("keeps future open markets open", () => {
    expect(
      getEffectiveMarketStatus({
        closesAt: "2026-05-26T10:00:01.000Z",
        now: new Date("2026-05-26T10:00:00.000Z"),
        status: "open",
      })
    ).toBe("open");
  });

  it("keeps resolved markets resolved after their close date", () => {
    expect(
      getEffectiveMarketStatus({
        closesAt: "2026-05-26T09:59:59.000Z",
        now: new Date("2026-05-26T10:00:00.000Z"),
        status: "resolved",
      })
    ).toBe("resolved");
  });
});

describe("formatMarketTimeRemaining", () => {
  it("formats remaining days, hours, and minutes", () => {
    expect(
      formatMarketTimeRemaining({
        closesAt: "2026-05-28T12:30:00.000Z",
        now: new Date("2026-05-26T10:00:00.000Z"),
      })
    ).toBe("2T 2Std 30Min");
  });

  it("formats remaining seconds for markets closing within one minute", () => {
    expect(
      formatMarketTimeRemaining({
        closesAt: "2026-05-26T10:00:45.000Z",
        now: new Date("2026-05-26T10:00:00.000Z"),
      })
    ).toBe("45Sek");
  });

  it("returns expired when the close date is in the past", () => {
    expect(
      formatMarketTimeRemaining({
        closesAt: "2026-05-26T09:59:59.000Z",
        now: new Date("2026-05-26T10:00:00.000Z"),
      })
    ).toBe("Abgelaufen");
  });
});
