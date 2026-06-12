/** Cookie flags for local http:// vs production https:// */
export function authCookieSecureFlag(): string {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

export function setSbAccessToken(accessToken: string): void {
  document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${authCookieSecureFlag()}`;
}

export function setSbRefreshToken(refreshToken: string): void {
  document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${authCookieSecureFlag()}`;
}

export function clearSbAuthCookies(): void {
  const secure = authCookieSecureFlag();
  document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secure}`;
  document.cookie = `sb-refresh-token=; path=/; max-age=0; SameSite=Lax${secure}`;
}
