import { describe, expect, test } from "vitest";
import { classNames } from "./classNames";

describe("classNames", () => {
  test("複数のクラス名を結合する", () => {
    const result = classNames("foo", "bar", "baz");
    expect(result).toBe("foo bar baz");
  });

  test("undefined の値をフィルタリングする", () => {
    const result = classNames("foo", undefined, "bar");
    expect(result).toBe("foo bar");
  });

  test("false の値をフィルタリングする", () => {
    const result = classNames("foo", false, "bar");
    expect(result).toBe("foo bar");
  });

  test("undefined と false を混在してフィルタリングする", () => {
    const result = classNames("foo", undefined, "bar", false, "baz");
    expect(result).toBe("foo bar baz");
  });

  test("空の配列の場合は空文字列を返す", () => {
    const result = classNames();
    expect(result).toBe("");
  });

  test("すべての値が falsy な場合は空文字列を返す", () => {
    const result = classNames(undefined, false, undefined);
    expect(result).toBe("");
  });

  test("条件付きクラス名を扱う", () => {
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
