import { useEffect, useState } from "react";

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

  // Monitor cookie changes
  useEffect(() => {
    const checkCookie = () => {
      const cookieValue = getCookie(id);
      setIsActive(cookieValue === "1");
    };

    // Check cookie periodically (every 1 second)
    const intervalId = setInterval(checkCookie, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [id]);

  const setFlag = (expireTime: Date) => {
    const expires = expireTime.toUTCString();
    document.cookie = `${id}=1; expires=${expires}; path=/; SameSite=Lax`;
    setIsActive(true);
  };

  return [isActive, setFlag];
}

/**
 * Get a value from cookies
 */
function getCookie(name: string): string | undefined {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return value;
    }
  }
  return undefined;
}
