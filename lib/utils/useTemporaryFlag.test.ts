import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useTemporaryFlag } from "./useTemporaryFlag";

describe("useTemporaryFlag", () => {
  const TEST_ID = "test-flag";

  beforeEach(() => {
    // Clear cookies
    document.cookie = `${TEST_ID}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  afterEach(() => {
    // Clear cookies
    document.cookie = `${TEST_ID}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it("should return false in initial state", () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));
    const [isActive] = result.current;

    expect(isActive).toBe(false);
  });

  it("should set flag to true when setFlag is called", () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));

    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    act(() => {
      const [, setFlag] = result.current;
      setFlag(expireTime);
    });

    const [isActive] = result.current;
    expect(isActive).toBe(true);
  });

  it("should set cookie correctly", () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));

    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    act(() => {
      const [, setFlag] = result.current;
      setFlag(expireTime);
    });

    // Check cookie
    const cookies = document.cookie.split("; ");
    const testCookie = cookies.find((cookie) => cookie.startsWith(TEST_ID));

    expect(testCookie).toBeDefined();
    expect(testCookie).toContain(`${TEST_ID}=1`);
  });

  it("should set flag to false when cookie expires", async () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));

    // Set expiration time to 1 hour later
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    act(() => {
      const [, setFlag] = result.current;
      setFlag(expireTime);
    });

    // Confirm flag is set to true
    expect(result.current[0]).toBe(true);

    // Manually delete cookie to simulate expiration
    document.cookie = `${TEST_ID}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

    // Wait for the cookie to be detected as expired (checked every 1 second)
    await waitFor(
      () => {
        expect(result.current[0]).toBe(false);
      },
      { timeout: 2000, interval: 100 },
    );
  });

  it("should return true in initial state when cookie already exists", () => {
    // Set cookie beforehand
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    document.cookie = `${TEST_ID}=1; expires=${expireTime.toUTCString()}; path=/; SameSite=Lax`;

    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));
    const [isActive] = result.current;

    expect(isActive).toBe(true);
  });

  it("should manage flags with different IDs independently", () => {
    const ID_1 = "flag-1";
    const ID_2 = "flag-2";

    const { result: result1 } = renderHook(() => useTemporaryFlag(ID_1));
    const { result: result2 } = renderHook(() => useTemporaryFlag(ID_2));

    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    // Set flag only for ID_1
    act(() => {
      const [, setFlag] = result1.current;
      setFlag(expireTime);
    });

    expect(result1.current[0]).toBe(true);
    expect(result2.current[0]).toBe(false);

    // Cleanup
    document.cookie = `${ID_1}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${ID_2}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
});
