export const THEME_STORAGE_KEY = "tahsilat-theme";

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var r=document.documentElement;r.setAttribute("data-theme",t);r.setAttribute("data-bs-theme",t);r.style.colorScheme=t;r.classList.toggle("dark-mode",t==="dark");}catch(e){}})();`;

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    return null;
  }

  return null;
}

export function getPreferredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getResolvedTheme() {
  return getStoredTheme() || getPreferredTheme();
}

export function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  const next = theme === "dark" ? "dark" : "light";
  const root = document.documentElement;

  root.setAttribute("data-theme", next);
  root.setAttribute("data-bs-theme", next);
  root.style.colorScheme = next;
  root.classList.toggle("dark-mode", next === "dark");
}

export function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
}
