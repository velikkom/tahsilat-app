import { getToken } from "@/utils/tokenStorage";
import {
  handleSessionTerminated,
  isSessionTerminatedPayload,
  SessionTerminatedError,
} from "@/services/sessionTerminatedHandler";
import { buildUrl, readResponseBody, serializeBody } from "./apiClientHelpers";

/**
 * Central fetch wrapper for authenticated API calls.
 * Handles 401 SESSION_TERMINATED globally.
 */
export async function apiFetch(path, options = {}) {
  const { auth = true, headers = {}, body, method = "GET", ...rest } = options;
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
    body: serializeBody(body, isFormData),
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
