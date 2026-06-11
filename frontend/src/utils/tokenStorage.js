const TOKEN_KEY = "token";
const REMEMBER_ME_KEY = "auth_remember_me";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `token=${token}; path=/`;
}

export function saveRememberMe(remember) {
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

export function loadRememberMe() {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.clear();
  sessionStorage.clear();
  document.cookie = "token=; Max-Age=0; path=/";
}

export function isAuthenticated() {
  return !!getToken();
}
