const WEB_PREVIEW_HOST_PATTERN =
  /^m324-web(?:-[a-z0-9-]+)?-riciyts-projects\.vercel\.app$/;

export const getConfiguredOrigins = (value: string): string[] =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const isAllowedWebOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);

    return (
      url.protocol === "https:" && WEB_PREVIEW_HOST_PATTERN.test(url.hostname)
    );
  } catch {
    return false;
  }
};

export const getAllowedOrigin = (
  origin: string | undefined,
  configuredOrigins: string[]
): string => {
  if (!origin) {
    return configuredOrigins[0] ?? "";
  }

  if (configuredOrigins.includes(origin) || isAllowedWebOrigin(origin)) {
    return origin;
  }

  return configuredOrigins[0] ?? "";
};
