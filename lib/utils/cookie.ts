/**
 * Get a value from cookies
 *
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value if found, undefined otherwise
 */
export function getCookie(name: string): string | undefined {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return value;
    }
  }
  return undefined;
}

/**
 * Set a cookie with an expiration date
 *
 * @param name - The name of the cookie
 * @param value - The value to set
 * @param expires - The expiration date
 */
export function setCookie(name: string, value: string, expires: Date): void {
  const expiresString = expires.toUTCString();
  document.cookie = `${name}=${value}; expires=${expiresString}; path=/; SameSite=Lax`;
}
