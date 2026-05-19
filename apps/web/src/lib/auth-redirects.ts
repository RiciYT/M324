const TRAILING_SLASHES_PATTERN = /\/+$/;

export function createAuthRedirectUrls(origin: string) {
  const normalizedOrigin = origin.replace(TRAILING_SLASHES_PATTERN, "");

  return {
    callbackURL: `${normalizedOrigin}/dashboard`,
    errorCallbackURL: `${normalizedOrigin}/login`,
    newUserCallbackURL: `${normalizedOrigin}/dashboard`,
  };
}

export function createBrowserAuthRedirectUrls() {
  return createAuthRedirectUrls(window.location.origin);
}
