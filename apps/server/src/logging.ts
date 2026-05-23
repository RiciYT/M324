type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, boolean | number | string | undefined>;

interface LokiStreamValues {
  stream: Record<string, string>;
  values: [string, string][];
}

interface LokiPushPayload {
  streams: LokiStreamValues[];
}

interface LokiRuntimeConfig {
  environment: string;
  password?: string;
  serviceName: string;
  url?: string;
  username?: string;
}

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

const defaultLokiRuntimeConfig: LokiRuntimeConfig = {
  environment: process.env.NODE_ENV ?? "development",
  password: process.env.LOKI_PASSWORD,
  serviceName: process.env.LOKI_SERVICE_NAME ?? "m324-server",
  url: process.env.LOKI_URL,
  username: process.env.LOKI_USERNAME,
};

const createLokiAuthHeader = (username: string, password: string): string =>
  `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

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

export const createLokiPayload = (
  entry: AppLogEntry,
  config: Pick<LokiRuntimeConfig, "environment" | "serviceName">
): LokiPushPayload => ({
  streams: [
    {
      stream: {
        app: config.serviceName,
        env: config.environment,
        event: entry.event,
        level: entry.level,
      },
      values: [
        [`${Date.parse(entry.timestamp) * 1_000_000}`, JSON.stringify(entry)],
      ],
    },
  ],
});

const sendLogToLoki = async (
  entry: AppLogEntry,
  config: LokiRuntimeConfig
): Promise<void> => {
  if (!config.url) {
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.username && config.password) {
    headers.Authorization = createLokiAuthHeader(
      config.username,
      config.password
    );
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers,
    body: JSON.stringify(
      createLokiPayload(entry, {
        environment: config.environment,
        serviceName: config.serviceName,
      })
    ),
  });

  if (!response.ok) {
    throw new Error(`Loki push failed with status ${response.status}`);
  }
};

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
  } else if (level === "warn") {
    console.warn(serializedEntry);
  } else {
    console.info(serializedEntry);
  }

  sendLogToLoki(entry, defaultLokiRuntimeConfig).catch((error: unknown) => {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Loki transport error";

    console.error(
      JSON.stringify({
        context: {
          errorMessage,
          lokiUrl: defaultLokiRuntimeConfig.url,
        },
        event: logEvents.requestFailed,
        level: "error",
        message: "Failed to ship log entry to Loki",
        timestamp: new Date().toISOString(),
      })
    );
  });
};
