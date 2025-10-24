import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCookie, setCookie } from "./cookie";

describe("cookie utils", () => {
  const TEST_COOKIE_NAME = "test-cookie";

  beforeEach(() => {
    // Clear cookies
    document.cookie = `${TEST_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  afterEach(() => {
    // Clear cookies
    document.cookie = `${TEST_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  describe("getCookie", () => {
    it("should return undefined when cookie does not exist", () => {
      const result = getCookie(TEST_COOKIE_NAME);
      expect(result).toBeUndefined();
    });

    it("should return cookie value when cookie exists", () => {
      const expireTime = new Date();
      expireTime.setHours(expireTime.getHours() + 1);
      document.cookie = `${TEST_COOKIE_NAME}=testvalue; expires=${expireTime.toUTCString()}; path=/`;

      const result = getCookie(TEST_COOKIE_NAME);
      expect(result).toBe("testvalue");
    });

    it("should return correct value for numeric cookie value", () => {
      const expireTime = new Date();
      expireTime.setHours(expireTime.getHours() + 1);
      document.cookie = `${TEST_COOKIE_NAME}=1; expires=${expireTime.toUTCString()}; path=/`;

      const result = getCookie(TEST_COOKIE_NAME);
      expect(result).toBe("1");
    });

    it("should return undefined for non-existent cookie among multiple cookies", () => {
      const expireTime = new Date();
      expireTime.setHours(expireTime.getHours() + 1);
      document.cookie = `other-cookie=value; expires=${expireTime.toUTCString()}; path=/`;

      const result = getCookie(TEST_COOKIE_NAME);
      expect(result).toBeUndefined();

      // Cleanup
      document.cookie =
        "other-cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
  });

  describe("setCookie", () => {
    it("should set cookie with correct value and expiration", () => {
      const expireTime = new Date();
      expireTime.setHours(expireTime.getHours() + 1);

      setCookie(TEST_COOKIE_NAME, "testvalue", expireTime);

      const cookies = document.cookie.split("; ");
      const testCookie = cookies.find((cookie) =>
        cookie.startsWith(TEST_COOKIE_NAME),
      );

      expect(testCookie).toBeDefined();
      expect(testCookie).toContain(`${TEST_COOKIE_NAME}=testvalue`);
    });

    it("should set numeric value correctly", () => {
      const expireTime = new Date();
      expireTime.setHours(expireTime.getHours() + 1);

      setCookie(TEST_COOKIE_NAME, "1", expireTime);

      const result = getCookie(TEST_COOKIE_NAME);
      expect(result).toBe("1");
    });

    it("should overwrite existing cookie", () => {
      const expireTime = new Date();
      expireTime.setHours(expireTime.getHours() + 1);

      setCookie(TEST_COOKIE_NAME, "first", expireTime);
      setCookie(TEST_COOKIE_NAME, "second", expireTime);

      const result = getCookie(TEST_COOKIE_NAME);
      expect(result).toBe("second");
    });
  });
});
