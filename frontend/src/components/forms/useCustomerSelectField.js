import { useEffect, useMemo, useState } from "react";
import {
  customerDisplayName,
  filterCustomersByQuery,
} from "@/utils/customerUtils";
import { createCustomerSelectHandlers } from "./customerSelectHandlers";

export default function useCustomerSelectField({
  value,
  onChange,
  customers,
  wrapperRef,
}) {
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === value) || null,
    [customers, value]
  );
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selectedName = selectedCustomer
    ? customerDisplayName(selectedCustomer)
    : "";

  useEffect(() => {
    if (value && selectedName) {
      setQuery(selectedName);
    }
  }, [value, selectedName]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [wrapperRef]);

  const suggestions = useMemo(
    () => filterCustomersByQuery(customers, query),
    [customers, query]
  );
  const handlers = createCustomerSelectHandlers({
    onChange,
    selectedCustomer,
    suggestions,
    setQuery,
    setOpen,
  });

  return {
    query,
    open,
    setOpen,
    suggestions,
    ...handlers,
  };
}
