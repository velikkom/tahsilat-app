"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomerById } from "@/services/customerService";

export default function useCustomerDetail() {
  const params = useParams();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerById(customerId);
      setCustomer(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    // Load when the route customer id changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async detail load
    void fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    loading,
    error,
    refresh: fetchCustomer,
  };
}
