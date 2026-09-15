import { apiFetchJson } from "@/services/apiClient";

function uploadTripImportFiles(path, collectionFile, expenseFile, extraParams = {}) {
  const formData = new FormData();
  formData.append("collectionFile", collectionFile);
  formData.append("expenseFile", expenseFile);

  const query = new URLSearchParams(extraParams).toString();
  const suffix = query ? `?${query}` : "";

  return apiFetchJson(`/trips/import${path}${suffix}`, {
    method: "POST",
    body: formData,
    errorMessage: "Excel import işlemi başarısız",
  });
}

export function dryRunTripImport(collectionFile, expenseFile) {
  return uploadTripImportFiles("/dry-run", collectionFile, expenseFile);
}

export function importTripFromExcel(collectionFile, expenseFile, confirmOverlap = false) {
  return uploadTripImportFiles("", collectionFile, expenseFile, { confirmOverlap });
}
