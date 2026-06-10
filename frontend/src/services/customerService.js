import { API_V1 } from "@/config/api";

const BASE_URL = API_V1;

export async function getCustomers({
  page = 0,
  size = 100,
} = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/customers?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Customers fetch failed");
  }

  return response.json();
}

export async function getCustomerById(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/customers/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Customer fetch failed");
  }

  return response.json();
}

export async function getCustomerCollections(customerId, { size = 500 } = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/collections/customer/${customerId}?page=0&size=${size}`,
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