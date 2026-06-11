import { getCustomers } from "@/services/customerService";

export async function fetchCustomersActions() {
  try {
    const data = await getCustomers({
      size: 500,
    });
    return data.content;
  } catch (error) {
    console.error(error);
    throw error;
  }
}