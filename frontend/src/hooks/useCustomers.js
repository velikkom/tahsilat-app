"use client";

import { useEffect, useState } from "react";
import { fetchCustomersActions } from "@/actions/customerActions";

export default function useCustomers() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await fetchCustomersActions();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { customers, loading, loadCustomers, refresh: loadCustomers };
}
