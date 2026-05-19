import { describe, expect, it } from "vitest";

import { createSocialProviders } from "./auth-social-providers.js";

describe("createSocialProviders", () => {
  it("enables google when both google credentials are configured", () => {
    const providers = createSocialProviders({
      GOOGLE_CLIENT_ID: "google-client-id",
      GOOGLE_CLIENT_SECRET: "google-client-secret",
    });

    expect(providers).toEqual({
      google: {
        clientId: "google-client-id",
        clientSecret: "google-client-secret",
        prompt: "select_account",
      },
    });
  });

  it("does not enable google when credentials are incomplete", () => {
    expect(
      createSocialProviders({
        GOOGLE_CLIENT_ID: "google-client-id",
      })
    ).toEqual({});
  });
});
