import { describe, expect, it } from "vitest";

import { createAuthRedirectUrls } from "./auth-redirects";

describe("createAuthRedirectUrls", () => {
  it("builds absolute frontend redirect urls from an origin", () => {
    expect(createAuthRedirectUrls("https://m324-web.vercel.app")).toEqual({
      callbackURL: "https://m324-web.vercel.app/markets",
      errorCallbackURL: "https://m324-web.vercel.app/login",
      newUserCallbackURL: "https://m324-web.vercel.app/markets",
    });
  });

  it("normalizes trailing slashes from the origin", () => {
    expect(createAuthRedirectUrls("http://localhost:3001/")).toEqual({
      callbackURL: "http://localhost:3001/markets",
      errorCallbackURL: "http://localhost:3001/login",
      newUserCallbackURL: "http://localhost:3001/markets",
    });
  });
});
