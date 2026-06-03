const BASE_URL = "http://localhost:8080/api/v1";

function getAuthHeaders(includeJson = false) {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

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

export async function getCollections({
  page = 0,
  size = 100,
} = {}) {
  const response = await fetch(
    `${BASE_URL}/collections?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Collections fetch failed");
  }

  return response.json();
}

export async function createCollection(payload) {
  const response = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorResponse(response, "Collection create failed")
    );
  }

  return response.json();
}

export async function getCollectionById(id) {
  const response = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Collection fetch failed");
  }

  return response.json();
}

export async function updateCollection(id, payload) {
  const response = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorResponse(response, "Collection update failed")
    );
  }

  return response.json();
}

export async function deleteCollection(id) {
  const response = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorResponse(response, "Collection delete failed")
    );
  }

  return true;
}
