import { apiFetchJson } from "@/services/apiClient";

export function getCollections({ page = 0, size = 100 } = {}) {
  return apiFetchJson(`/collections?page=${page}&size=${size}`, {
    errorMessage: "Collections fetch failed",
  });
}

export function createCollection(payload) {
  return apiFetchJson("/collections", {
    method: "POST",
    body: payload,
    errorMessage: "Collection create failed",
  });
}

export function getCollectionById(id) {
  return apiFetchJson(`/collections/${id}`, {
    errorMessage: "Collection fetch failed",
  });
}

export function updateCollection(id, payload) {
  return apiFetchJson(`/collections/${id}`, {
    method: "PUT",
    body: payload,
    errorMessage: "Collection update failed",
  });
}

export async function deleteCollection(id) {
  await apiFetchJson(`/collections/${id}`, {
    method: "DELETE",
    errorMessage: "Collection delete failed",
  });

  return true;
}
