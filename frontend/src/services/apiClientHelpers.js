import { API_V1 } from "@/config/api";

export function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_V1}${path}`;
  }

  return `${API_V1}/${path}`;
}

export async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export function serializeBody(body, isFormData) {
  if (body == null) {
    return undefined;
  }

  if (isFormData || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}
