import { API_V1 } from "@/config/api";
import { getToken } from "@/services/authService";

const BASE_URL = `${API_V1}/users`;

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function parseError(response, fallback) {
  try {
    const data = await response.json();
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/me`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Kullanıcı bilgisi alınamadı"));
  }

  return response.json();
}

export async function getAllUsers() {
  const response = await fetch(BASE_URL, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Kullanıcı listesi alınamadı"));
  }

  return response.json();
}

export async function getPendingUsersCount() {
  const response = await fetch(`${BASE_URL}/pending/count`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Bildirim sayısı alınamadı"));
  }

  return response.json();
}

export async function activateUser(userId) {
  const response = await fetch(`${BASE_URL}/${userId}/activate`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Kullanıcı aktifleştirilemedi"));
  }

  return response.json();
}

export async function deactivateUser(userId) {
  const response = await fetch(`${BASE_URL}/${userId}/deactivate`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Kullanıcı pasifleştirilemedi"));
  }

  return response.json();
}
