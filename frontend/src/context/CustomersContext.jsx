"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCustomers } from "@/services/customerService";

const CUSTOMERS_FETCH_SIZE = 500;

const CustomersContext = createContext(null);

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastCreatedCustomerId, setLastCreatedCustomerId] = useState("");

  const refreshCustomers = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await getCustomers({ size: CUSTOMERS_FETCH_SIZE });
      setCustomers(response.content || []);
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  const registerCustomerCreated = useCallback(
    async (customer) => {
      if (!customer?.id) {
        return refreshCustomers({ silent: true });
      }

      setLastCreatedCustomerId(customer.id);
      setCustomers((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== customer.id);
        return [customer, ...withoutDuplicate];
      });

      await refreshCustomers({ silent: true });

      return customer;
    },
    [refreshCustomers]
  );

  const clearLastCreatedCustomerId = useCallback(() => {
    setLastCreatedCustomerId("");
  }, []);

  const value = useMemo(
    () => ({
      customers,
      loading,
      lastCreatedCustomerId,
      refreshCustomers,
      refresh: refreshCustomers,
      registerCustomerCreated,
      clearLastCreatedCustomerId,
    }),
    [
      customers,
      loading,
      lastCreatedCustomerId,
      refreshCustomers,
      registerCustomerCreated,
      clearLastCreatedCustomerId,
    ]
  );

  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  );
}

export default function useCustomers() {
  const context = useContext(CustomersContext);

  if (!context) {
    throw new Error("useCustomers must be used within CustomersProvider");
  }

  return context;
}
