import { API_V1 } from "@/config/api";

const BASE_URL = `${API_V1}/auth`;;

export async function login(email, password) {
  const response = await fetch(
    `${BASE_URL}/login`,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function register(payload) {
  const response = await fetch(
    `${BASE_URL}/register`,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Register failed");
  }

  return response.json();
}

export function saveToken(token) {
  localStorage.setItem("token", token);

  document.cookie = `token=${token}; path=/`;
}

const REMEMBER_ME_KEY = "auth_remember_me";

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
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");

  document.cookie = "token=; Max-Age=0; path=/";
}
export function isAuthenticated() {
  return !!getToken();
}
