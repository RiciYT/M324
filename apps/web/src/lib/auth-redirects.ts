const TRAILING_SLASHES_PATTERN = /\/+$/;

export function createAuthRedirectUrls(origin: string) {
  const normalizedOrigin = origin.replace(TRAILING_SLASHES_PATTERN, "");

  return {
    callbackURL: `${normalizedOrigin}/markets`,
    errorCallbackURL: `${normalizedOrigin}/login`,
    newUserCallbackURL: `${normalizedOrigin}/markets`,
  };
}

export function createBrowserAuthRedirectUrls() {
  return createAuthRedirectUrls(window.location.origin);
}
