import { API_V1 } from "@/config/api";
import { getToken } from "@/utils/tokenStorage";
import {
  handleSessionTerminated,
  isSessionTerminatedPayload,
  SessionTerminatedError,
} from "@/services/sessionTerminatedHandler";

function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_V1}${path}`;
  }

  return `${API_V1}/${path}`;
}

async function readResponseBody(response) {
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

/**
 * Central fetch wrapper for authenticated API calls.
 * Handles 401 SESSION_TERMINATED globally.
 */
export async function apiFetch(path, options = {}) {
  const {
    auth = true,
    headers = {},
    body,
    method = "GET",
    ...rest
  } = options;

  const requestHeaders = { ...headers };
  const isFormData = body instanceof FormData;

  if (auth) {
    const token = getToken();

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  if (body != null && !isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body:
      body == null
        ? undefined
        : isFormData
          ? body
          : typeof body === "string"
            ? body
            : JSON.stringify(body),
    ...rest,
  });

  if (response.status === 401) {
    const payload = await readResponseBody(response.clone());

    if (isSessionTerminatedPayload(payload)) {
      await handleSessionTerminated();
      throw new SessionTerminatedError();
    }
  }

  return response;
}

export async function apiFetchJson(path, options = {}) {
  const { errorMessage = "İstek başarısız", ...fetchOptions } = options;
  const response = await apiFetch(path, fetchOptions);

  if (!response.ok) {
    const payload = await readResponseBody(response);
    throw new Error(payload?.message || errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}
