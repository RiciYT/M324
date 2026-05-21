import { describe, expect, it } from "vitest";
import {
  getAllowedOrigin,
  getConfiguredOrigins,
  isAllowedWebOrigin,
} from "./origins.js";

describe("origin handling", () => {
  it("parses configured origins and ignores empty entries", () => {
    expect(
      getConfiguredOrigins(
        "https://m324-web.vercel.app, http://localhost:5173, ,"
      )
    ).toEqual(["https://m324-web.vercel.app", "http://localhost:5173"]);
  });

  it("allows Vercel preview domains for the web project", () => {
    expect(
      isAllowedWebOrigin(
        "https://m324-web-git-preview-riciyts-projects.vercel.app"
      )
    ).toBe(true);
  });

  it("rejects non-HTTPS and unrelated Vercel origins", () => {
    expect(
      isAllowedWebOrigin(
        "http://m324-web-git-preview-riciyts-projects.vercel.app"
      )
    ).toBe(false);
    expect(
      isAllowedWebOrigin("https://m324-server-riciyts-projects.vercel.app")
    ).toBe(false);
  });

  it("treats localhost and 127.0.0.1 as equivalent local origins", () => {
    expect(
      getAllowedOrigin("http://127.0.0.1:5173", ["http://localhost:5173"])
    ).toBe("http://127.0.0.1:5173");
  });

  it("falls back to the first configured origin for missing or denied origins", () => {
    const configuredOrigins = [
      "https://m324-web.vercel.app",
      "http://localhost:5173",
    ];

    expect(getAllowedOrigin(undefined, configuredOrigins)).toBe(
      "https://m324-web.vercel.app"
    );
    expect(getAllowedOrigin("https://evil.example", configuredOrigins)).toBe(
      "https://m324-web.vercel.app"
    );
  });
});
