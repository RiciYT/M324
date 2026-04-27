import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("joins simple class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("ignores false and undefined values", () => {
    const isHidden = false;

    expect(cn("rounded", isHidden ? "hidden" : undefined, undefined)).toBe(
      "rounded"
    );
  });

  it("keeps conditional classes when the condition is true", () => {
    const isActive = true;

    expect(cn("button", isActive ? "button-active" : undefined)).toBe(
      "button button-active"
    );
  });

  it("merges conflicting Tailwind padding classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges conflicting Tailwind text color classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
