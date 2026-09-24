import { customerDisplayName } from "@/utils/customerUtils";

export function createCustomerSelectHandlers({
  onChange,
  selectedCustomer,
  suggestions,
  setQuery,
  setOpen,
}) {
  function emitCustomerId(nextId) {
    onChange({
      target: { name: "customerId", value: nextId },
    });
  }

  function handleInputChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setOpen(true);

    if (
      selectedCustomer &&
      nextQuery.trim() !== customerDisplayName(selectedCustomer)
    ) {
      emitCustomerId("");
    }
  }

  function handleSelect(customer) {
    emitCustomerId(customer.id);
    setQuery(customerDisplayName(customer));
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (suggestions.length === 1) {
      handleSelect(suggestions[0]);
    }
  }

  return { handleInputChange, handleSelect, handleKeyDown };
}
