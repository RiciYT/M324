import { describe, expect, it } from "vitest";

import { createLogEntry, logEvents } from "./logging.js";

describe("createLogEntry", () => {
  it("creates an info log entry with the selected event", () => {
    const entry = createLogEntry(
      "info",
      logEvents.serverListening,
      "Server is listening"
    );

    expect(entry.level).toBe("info");
    expect(entry.event).toBe("server.listening");
  });

  it("keeps the provided message unchanged", () => {
    const message = "Healthcheck requested";
    const entry = createLogEntry(
      "info",
      logEvents.healthcheckRequested,
      message
    );

    expect(entry.message).toBe(message);
  });

  it("stores context values for later observability tooling", () => {
    const entry = createLogEntry(
      "info",
      logEvents.requestCompleted,
      "Request completed",
      {
        method: "GET",
        path: "/",
        status: 200,
      }
    );

    expect(entry.context).toEqual({
      method: "GET",
      path: "/",
      status: 200,
    });
  });

  it("creates ISO timestamps", () => {
    const entry = createLogEntry(
      "warn",
      logEvents.corsConfigured,
      "CORS origin configured"
    );

    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
  });

  it("supports error-level entries", () => {
    const entry = createLogEntry(
      "error",
      logEvents.requestFailed,
      "Request failed",
      {
        errorMessage: "Database unavailable",
      }
    );

    expect(entry.level).toBe("error");
    expect(entry.context?.errorMessage).toBe("Database unavailable");
  });
});
