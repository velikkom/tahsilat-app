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

function triggerBlobDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

/**
 * These documents are binary xlsx, not JSON, so they use apiFetch directly
 * (apiFetchJson always tries to parse JSON) and trigger a browser download.
 */
async function downloadTripDocument(path, filename, errorMessage) {
  const response = await apiFetch(path);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  triggerBlobDownload(blob, filename);
}

export function downloadTripExpenseDocument(id) {
  return downloadTripDocument(
    `/trips/${id}/expense-document.xlsx`,
    `harcama-dokumani-${id}.xlsx`,
    "Harcama dokümanı indirilemedi"
  );
}

export function downloadTripCollectionDocument(id) {
  return downloadTripDocument(
    `/trips/${id}/collection-document.xlsx`,
    `tahsilat-dokumu-${id}.xlsx`,
    "Tahsilat dökümü indirilemedi"
  );
}
