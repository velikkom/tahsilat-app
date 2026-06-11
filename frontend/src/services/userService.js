import { apiFetchJson } from "@/services/apiClient";

const BASE_PATH = "/users";

export function getCurrentUser() {
  return apiFetchJson(`${BASE_PATH}/me`, {
    errorMessage: "Kullanıcı bilgisi alınamadı",
  });
}

export function getAllUsers() {
  return apiFetchJson(BASE_PATH, {
    errorMessage: "Kullanıcı listesi alınamadı",
  });
}

export function getPendingUsersCount() {
  return apiFetchJson(`${BASE_PATH}/pending/count`, {
    errorMessage: "Bildirim sayısı alınamadı",
  });
}

export function activateUser(userId) {
  return apiFetchJson(`${BASE_PATH}/${userId}/activate`, {
    method: "PATCH",
    errorMessage: "Kullanıcı aktifleştirilemedi",
  });
}

export function deactivateUser(userId) {
  return apiFetchJson(`${BASE_PATH}/${userId}/deactivate`, {
    method: "PATCH",
    errorMessage: "Kullanıcı pasifleştirilemedi",
  });
}

export function getRoles() {
  return apiFetchJson(`${BASE_PATH}/roles`, {
    errorMessage: "Roller alınamadı",
  });
}

export function updateUserRole(userId, role) {
  return apiFetchJson(`${BASE_PATH}/${userId}/role`, {
    method: "PATCH",
    body: { role },
    errorMessage: "Rol güncellenemedi",
  });
}
