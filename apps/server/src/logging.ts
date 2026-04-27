type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, boolean | number | string | undefined>;

export const logEvents = {
  authRequestReceived: "auth.request.received",
  corsConfigured: "server.cors.configured",
  databaseConfigured: "database.configured",
  environmentLoaded: "server.environment.loaded",
  faviconIgnored: "server.favicon.ignored",
  healthcheckRequested: "server.healthcheck.requested",
  requestFailed: "server.request.failed",
  requestStarted: "server.request.started",
  requestCompleted: "server.request.completed",
  serverListening: "server.listening",
} as const;

export type LogEvent = (typeof logEvents)[keyof typeof logEvents];

export interface AppLogEntry {
  context?: LogContext;
  event: LogEvent;
  level: LogLevel;
  message: string;
  timestamp: string;
}

export const createLogEntry = (
  level: LogLevel,
  event: LogEvent,
  message: string,
  context?: LogContext
): AppLogEntry => ({
  context,
  event,
  level,
  message,
  timestamp: new Date().toISOString(),
});

export const writeLog = (
  level: LogLevel,
  event: LogEvent,
  message: string,
  context?: LogContext
) => {
  const entry = createLogEntry(level, event, message, context);
  const serializedEntry = JSON.stringify(entry);

  if (level === "error") {
    console.error(serializedEntry);
    return;
  }

  if (level === "warn") {
    console.warn(serializedEntry);
    return;
  }

  console.info(serializedEntry);
};
