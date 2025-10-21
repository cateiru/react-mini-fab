import { describe, expect, test } from "vitest";
import { classNames } from "./classNames";

describe("classNames", () => {
  test("concatenates multiple class names", () => {
    const result = classNames("foo", "bar", "baz");
    expect(result).toBe("foo bar baz");
  });

  test("filters out undefined values", () => {
    const result = classNames("foo", undefined, "bar");
    expect(result).toBe("foo bar");
  });

  test("filters out false values", () => {
    const result = classNames("foo", false, "bar");
    expect(result).toBe("foo bar");
  });

  test("filters out both undefined and false values", () => {
    const result = classNames("foo", undefined, "bar", false, "baz");
    expect(result).toBe("foo bar baz");
  });

  test("returns an empty string for an empty array", () => {
    const result = classNames();
    expect(result).toBe("");
  });

  test("returns an empty string when all values are falsy", () => {
    const result = classNames(undefined, false, undefined);
    expect(result).toBe("");
  });

  test("handles conditional class names", () => {
    const isActive = true;
    const isDisabled = false;
    const result = classNames(
      "button",
      isActive && "active",
      isDisabled && "disabled",
    );
    expect(result).toBe("button active");
  });
});
