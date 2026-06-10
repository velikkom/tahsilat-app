"use client";

import { useEffect, useState } from "react";
import { getCustomerCollections } from "@/services/customerService";

export default function useCustomerCollections(customerId) {
  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCollections();
    }
  }, [customerId]);

  async function fetchCollections() {
    try {
      setLoading(true);

      const data = await getCustomerCollections(customerId);

      setCollections(data.content || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    collections,
    loading,
    refresh: fetchCollections,
  };
}
