import { apiFetchJson } from "@/services/apiClient";

function uploadImportFile(path, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetchJson(`/collections/import${path}`, {
    method: "POST",
    body: formData,
    errorMessage: "Excel import işlemi başarısız",
  });
}

export function dryRunCollectionImport(file) {
  return uploadImportFile("/dry-run", file);
}

export function importCollectionsFromExcel(file) {
  return uploadImportFile("", file);
}
