import { useCallback, useEffect, useRef, useState } from "react";
import { getCookie, setCookie } from "../utils/cookie";

/**
 * Custom hook to set a temporary flag using cookies
 *
 * @param id - Unique ID to use as the cookie name
 * @returns [isActive, setFlag, updateFromCookie] - Tuple of the flag state, a function to set the flag, and a function to sync with cookie
 *
 * @example
 *
 * ```tsx
 * const [isHidden, setHidden, updateFromCookie] = useTemporaryFlag('minifab-hidden');
 *
 * // Set a flag that expires in 24 hours
 * const hide24Hours = () => {
 *   const expireTime = new Date();
 *   expireTime.setHours(expireTime.getHours() + 24);
 *   setHidden(expireTime);
 * };
 *
 * // Manually sync with cookie state (e.g., after page becomes visible)
 * updateFromCookie();
 * ```
 */
export function useTemporaryFlag(
  id: string,
): [boolean, (expireTime: Date) => void, () => void] {
  const [isActive, setIsActive] = useState(false);

  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Reads the expiration timestamp from the cookie and schedules the flag to expire.
   * If the cookie has already expired or doesn't exist, sets isActive to false.
   */
  const updateFromCookie = useCallback(() => {
    const cookieValue = getCookie(id);

    if (!cookieValue) {
      setIsActive(false);
      return;
    }

    const expirationTime = Number.parseInt(cookieValue, 10);

    if (Number.isNaN(expirationTime)) {
      setIsActive(false);
      return;
    }

    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;

    if (timeUntilExpiration <= 0) {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    // Clear existing timeout if any
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }

    // Schedule the flag to expire
    timeoutIdRef.current = setTimeout(() => {
      setIsActive(false);
      timeoutIdRef.current = null;
    }, timeUntilExpiration);
  }, [id]);

  // Initialize on mount
  useEffect(() => {
    updateFromCookie();

    return () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [updateFromCookie]);

  const setFlag = useCallback(
    (expireTime: Date) => {
      const now = Date.now();
      const expirationTime = expireTime.getTime();
      const timeUntilExpiration = expirationTime - now;

      if (timeUntilExpiration <= 0) {
        return;
      }

      // Store expiration timestamp in cookie
      setCookie(id, expirationTime.toString(), expireTime);

      // Set flag to active
      setIsActive(true);

      // Clear existing timeout if any
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }

      // Schedule the flag to expire
      timeoutIdRef.current = setTimeout(() => {
        setIsActive(false);
        timeoutIdRef.current = null;
      }, timeUntilExpiration);
    },
    [id],
  );

  return [isActive, setFlag, updateFromCookie];
}
