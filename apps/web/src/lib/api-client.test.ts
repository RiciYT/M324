import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./api-client";

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends market creation requests with JSON headers and credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          closesAt: "2026-01-01T00:00:00.000Z",
          createdBy: "admin-1",
          description: "Description",
          id: "market-1",
          noPool: 0,
          status: "open",
          title: "Market title",
          yesPool: 0,
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.createMarket({
      closesAt: "2026-01-01T00:00:00.000Z",
      description: "Description",
      title: "Market title",
    });

    const [, requestInit] = fetchMock.mock.calls[0] ?? [];

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/markets",
      expect.objectContaining({
        body: JSON.stringify({
          closesAt: "2026-01-01T00:00:00.000Z",
          description: "Description",
          title: "Market title",
        }),
        credentials: "include",
        method: "POST",
      })
    );
    expect(requestInit?.headers).toBeInstanceOf(Headers);
    expect((requestInit?.headers as Headers).get("Content-Type")).toBe(
      "application/json"
    );
  });

  it("returns undefined for missing markets", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 }))
    );

    await expect(
      apiClient.getMarket("missing-market")
    ).resolves.toBeUndefined();
  });

  it("throws for non-404 API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    );

    await expect(apiClient.getMarket("market-1")).rejects.toThrow(
      "Request failed with status 500"
    );
  });
});
