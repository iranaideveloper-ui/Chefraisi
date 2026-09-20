export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("isAuthenticated=true"));
}

export function setAuthenticated(rememberMe = false): void {
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  document.cookie = `isAuthenticated=true; path=/; max-age=${maxAge}; samesite=strict`;
}
