import { API_V1 } from "@/config/api";

const BASE_URL = API_V1;

async function parseErrorResponse(response, fallbackMessage) {
  const errorText = await response.text();

  if (!errorText) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(errorText);

    return parsed.message || parsed.error || errorText;
  } catch {
    return errorText;
  }
}

async function uploadImportFile(path, file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/collections/import${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, "Excel import işlemi başarısız"));
  }

  return response.json();
}

export function dryRunCollectionImport(file) {
  return uploadImportFile("/dry-run", file);
}

export function importCollectionsFromExcel(file) {
  return uploadImportFile("", file);
}
