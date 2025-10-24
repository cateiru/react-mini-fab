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

  it("should set cookie with expiration timestamp", () => {
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

    // Extract the cookie value (should be a timestamp)
    const cookieValue = testCookie?.split("=")[1];
    expect(cookieValue).toBeDefined();

    const timestamp = Number.parseInt(cookieValue || "", 10);
    expect(Number.isNaN(timestamp)).toBe(false);
    expect(timestamp).toBeGreaterThan(Date.now());
  });

  it("should set flag to false when timeout expires", async () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));

    // Set expiration time to 100ms later
    const expireTime = new Date(Date.now() + 100);

    act(() => {
      const [, setFlag] = result.current;
      setFlag(expireTime);
    });

    // Wait for flag to be set to true
    await waitFor(
      () => {
        expect(result.current[0]).toBe(true);
      },
      { timeout: 200, interval: 10 },
    );

    // Wait for the timeout to expire
    await waitFor(
      () => {
        expect(result.current[0]).toBe(false);
      },
      { timeout: 500, interval: 50 },
    );
  });

  it("should return true in initial state when cookie already exists", () => {
    // Set cookie beforehand with expiration timestamp
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    const expirationTimestamp = expireTime.getTime();
    document.cookie = `${TEST_ID}=${expirationTimestamp}; expires=${expireTime.toUTCString()}; path=/; SameSite=Lax`;

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

  it("should not set flag when expiration time is in the past", () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));

    // Set expiration time to 1 hour ago
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() - 1);

    act(() => {
      const [, setFlag] = result.current;
      setFlag(expireTime);
    });

    // Flag should remain false
    expect(result.current[0]).toBe(false);
  });

  it("should return false when cookie has expired timestamp", () => {
    // Set cookie with expired timestamp
    const expiredTime = new Date();
    expiredTime.setHours(expiredTime.getHours() - 1);
    const expiredTimestamp = expiredTime.getTime();
    document.cookie = `${TEST_ID}=${expiredTimestamp}; expires=${new Date(Date.now() + 3600000).toUTCString()}; path=/; SameSite=Lax`;

    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));
    const [isActive] = result.current;

    expect(isActive).toBe(false);
  });

  it("should return false when cookie value is not a valid number", () => {
    // Set cookie with invalid value
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    document.cookie = `${TEST_ID}=invalid; expires=${expireTime.toUTCString()}; path=/; SameSite=Lax`;

    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));
    const [isActive] = result.current;

    expect(isActive).toBe(false);
  });

  it("should call updateFromCookie and sync state", () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));

    // Initially false
    expect(result.current[0]).toBe(false);

    // Set cookie manually
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    const expirationTimestamp = expireTime.getTime();
    document.cookie = `${TEST_ID}=${expirationTimestamp}; expires=${expireTime.toUTCString()}; path=/; SameSite=Lax`;

    // Call updateFromCookie
    act(() => {
      const [, , updateFromCookie] = result.current;
      updateFromCookie();
    });

    // Should now be true
    expect(result.current[0]).toBe(true);
  });

  it("should clear existing timeout when setFlag is called multiple times", async () => {
    const { result } = renderHook(() => useTemporaryFlag(TEST_ID));

    // Set first expiration time to 200ms
    const firstExpireTime = new Date(Date.now() + 200);

    act(() => {
      const [, setFlag] = result.current;
      setFlag(firstExpireTime);
    });

    // Wait for flag to be set to true
    await waitFor(
      () => {
        expect(result.current[0]).toBe(true);
      },
      { timeout: 200, interval: 10 },
    );

    // Wait a bit, then set second expiration time to 400ms from now
    await new Promise((resolve) => setTimeout(resolve, 50));
    const secondExpireTime = new Date(Date.now() + 400);

    act(() => {
      const [, setFlag] = result.current;
      setFlag(secondExpireTime);
    });

    // Wait for flag to still be true
    await waitFor(
      () => {
        expect(result.current[0]).toBe(true);
      },
      { timeout: 200, interval: 10 },
    );

    // Wait 200ms - first timeout (would have expired at 200ms) should have been cleared
    // Flag should still be true because second timeout is set for 400ms
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(result.current[0]).toBe(true);

    // Wait for second timeout to expire
    await waitFor(
      () => {
        expect(result.current[0]).toBe(false);
      },
      { timeout: 500, interval: 50 },
    );
  });
});
