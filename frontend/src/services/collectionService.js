const BASE_URL = "http://localhost:8080/api/v1";

export async function getCollections({
  page = 0,
  size = 100,
} = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/collections?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Collections fetch failed");
  }

  return response.json();
}

export async function createCollection(payload) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/collections`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Collection create failed"
    );
  }

  return response.json();
}

export async function getCollectionById(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/collections/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Collection fetch failed");
  }

  return response.json();
}

export async function deleteCollection(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/collections/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Collection delete failed");
  }

  return true;
}