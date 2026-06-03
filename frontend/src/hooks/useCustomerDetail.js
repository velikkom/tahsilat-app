"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomerById } from "@/services/customerService";

export default function useCustomerDetail() {
  const params = useParams();

  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, []);

  async function fetchCustomer() {
    try {
      setLoading(true);

      const data = await getCustomerById(params.id);

      setCustomer(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    customer,
    loading,
    refresh: fetchCustomer,
  };
}
