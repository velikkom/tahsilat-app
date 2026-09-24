import { apiFetch } from "@/services/apiClient";

export function triggerBlobDownload(blob, filename) {
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
export async function downloadTripDocument(path, filename, errorMessage) {
  const response = await apiFetch(path);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  triggerBlobDownload(blob, filename);
}

export async function getTripTahsilatDokumuFile(id) {
  const filename = `tahsilat-dokumu-${id}.xlsx`;
  const response = await apiFetch(`/trips/${id}/tahsilat-dokumu.xlsx`);

  if (!response.ok) {
    throw new Error("Tahsilat dökümü alınamadı");
  }

  const blob = await response.blob();

  return new File([blob], filename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadTripTahsilatDokumu(id) {
  return downloadTripDocument(
    `/trips/${id}/tahsilat-dokumu.xlsx`,
    `tahsilat-dokumu-${id}.xlsx`,
    "Tahsilat dökümü indirilemedi"
  );
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
