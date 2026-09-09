import { apiFetch, apiFetchJson } from "@/services/apiClient";

export function getTrips({ page = 0, size = 100 } = {}) {
  return apiFetchJson(`/trips?page=${page}&size=${size}`, {
    errorMessage: "Turlar getirilemedi",
  });
}

export function getTripById(id) {
  return apiFetchJson(`/trips/${id}`, {
    errorMessage: "Tur getirilemedi",
  });
}

export function createTrip(payload) {
  return apiFetchJson("/trips", {
    method: "POST",
    body: payload,
    errorMessage: "Tur oluşturulamadı",
  });
}

export function updateTrip(id, payload) {
  return apiFetchJson(`/trips/${id}`, {
    method: "PUT",
    body: payload,
    errorMessage: "Tur güncellenemedi",
  });
}

export async function deleteTrip(id) {
  await apiFetchJson(`/trips/${id}`, {
    method: "DELETE",
    errorMessage: "Tur silinemedi",
  });

  return true;
}

/**
 * The document is a binary xlsx, not JSON, so this uses apiFetch directly
 * (apiFetchJson always tries to parse JSON) and triggers a browser download.
 */
export async function downloadTripExpenseDocument(id) {
  const response = await apiFetch(`/trips/${id}/expense-document.xlsx`);

  if (!response.ok) {
    throw new Error("Harcama dokümanı indirilemedi");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `harcama-dokumani-${id}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
