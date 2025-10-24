import { useEffect, useRef, useState } from "react";
import { getCookie, setCookie } from "../utils/cookie";

/**
 * Custom hook to set a temporary flag using cookies
 *
 * @param id - Unique ID to use as the cookie name
 * @returns [isActive, setFlag] - Tuple of the flag state and a function to set the flag with an expiration time
 *
 * @example
 *
 * ```tsx
 * const [isHidden, setHidden] = useTemporaryFlag('minifab-hidden');
 *
 * // Set a flag that expires in 24 hours
 * const hide24Hours = () => {
 *   const expireTime = new Date();
 *   expireTime.setHours(expireTime.getHours() + 24);
 *   setHidden(expireTime);
 * };
 * ```
 */
export function useTemporaryFlag(
  id: string,
): [boolean, (expireTime: Date) => void] {
  const [isActive, setIsActive] = useState<boolean>(() => {
    return getCookie(id) === "1";
  });
  const timeoutIdRef = useRef<number | null>(null);

  // Monitor cookie state only when flag is active to detect manual deletion
  useEffect(() => {
    // Only set up polling if flag is active
    if (!isActive) {
      return;
    }

    const checkCookie = () => {
      const cookieValue = getCookie(id);
      // Update state if cookie was deleted externally
      if (cookieValue !== "1") {
        setIsActive(false);
        // Clear timeout since cookie is already gone
        if (timeoutIdRef.current !== null) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
      }
    };

    // Check cookie periodically to detect manual deletion
    // This is only active when isActive is true, minimizing unnecessary checks
    const intervalId = setInterval(checkCookie, 1000);

    return () => {
      clearInterval(intervalId);
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [id, isActive]);

  const setFlag = (expireTime: Date) => {
    setCookie(id, "1", expireTime);
    setIsActive(true);

    // Clear existing timeout
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }

    // Calculate milliseconds until expiration
    const now = Date.now();
    const expirationTime = expireTime.getTime();
    const timeUntilExpiration = expirationTime - now;

    // Set timeout to update state when cookie expires
    if (timeUntilExpiration > 0) {
      timeoutIdRef.current = setTimeout(() => {
        setIsActive(false);
        timeoutIdRef.current = null;
      }, timeUntilExpiration) as unknown as number;
    }
  };

  return [isActive, setFlag];
}
