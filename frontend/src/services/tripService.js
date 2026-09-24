import { apiFetchJson } from "@/services/apiClient";
import { triggerBlobDownload } from "./tripDownloads";

export {
  getTripTahsilatDokumuFile,
  downloadTripTahsilatDokumu,
  downloadTripExpenseDocument,
  downloadTripCollectionDocument,
} from "./tripDownloads";

export function getTrips({ page = 0, size = 100, fromDate, toDate } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  params.append("sort", "startDate,desc");
  params.append("sort", "createdAt,desc");

  if (fromDate) {
    params.append("fromDate", fromDate);
  }

  if (toDate) {
    params.append("toDate", toDate);
  }

  return apiFetchJson(`/trips?${params.toString()}`, {
    errorMessage: "Turlar getirilemedi",
  });
}

export function getTripById(id) {
  return apiFetchJson(`/trips/${id}`, {
    errorMessage: "Tur getirilemedi",
  });
}

export function getTripPrintPreview(id) {
  return apiFetchJson(`/trips/${id}/print-preview`, {
    errorMessage: "Çıktı önizlemesi getirilemedi",
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

export function downloadTripFile(file) {
  triggerBlobDownload(file, file.name);
}
