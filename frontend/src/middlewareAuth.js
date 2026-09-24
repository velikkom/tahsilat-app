/**
 * Structural-only check: does this cookie look like an unexpired JWT?
 * This does NOT verify the signature (the secret must never reach the
 * frontend bundle) - it only lets the middleware avoid redirect decisions
 * based on an empty/garbage cookie value. The backend's own JwtAuthenticationFilter
 * remains the actual security boundary; every API call still requires a
 * signature-verified, session-matched token regardless of what this returns.
 */
export function looksLikeUnexpiredJwt(token) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
