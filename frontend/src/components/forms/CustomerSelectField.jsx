"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Form } from "react-bootstrap";

import {
  customerDisplayName,
  filterCustomersByQuery,
} from "@/utils/customerUtils";

export default function CustomerSelectField({
  value,
  onChange,
  customers = [],
  loading = false,
  disabled = false,
  validated = false,
}) {
  const wrapperRef = useRef(null);
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
  }, []);

  const suggestions = useMemo(
    () => filterCustomersByQuery(customers, query),
    [customers, query]
  );

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

  const showInvalid = validated && !value;
  const placeholder = loading
    ? "Müşteriler yükleniyor..."
    : "Müşteri adı yazın";

  return (
    <div className="customer-select-field" ref={wrapperRef}>
      <Form.Group>
      <Form.Label>Müşteri</Form.Label>
      <Form.Control
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        isInvalid={showInvalid}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="customer-select-options"
      />
      <Form.Control.Feedback type="invalid">
        Müşteri seçiniz.
      </Form.Control.Feedback>

      <Form.Select
        required
        name="customerId"
        value={value}
        onChange={onChange}
        disabled={disabled}
        tabIndex={-1}
        className="visually-hidden"
        aria-hidden="true"
      >
        <option value="">Müşteri Seçiniz</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customerDisplayName(customer)}
          </option>
        ))}
      </Form.Select>

      {open && !disabled && (
        <ul
          id="customer-select-options"
          className="customer-select-field__list"
          role="listbox"
        >
          {suggestions.length === 0 ? (
            <li className="customer-select-field__empty">
              {loading ? "Müşteriler yükleniyor..." : "Eşleşen müşteri yok"}
            </li>
          ) : (
            suggestions.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  className="customer-select-field__option"
                  role="option"
                  aria-selected={customer.id === value}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(customer)}
                >
                  <span className="customer-select-field__name">
                    {customerDisplayName(customer)}
                  </span>
                  {customer.authorizedPerson &&
                    customer.authorizedPerson !==
                      customerDisplayName(customer) && (
                      <span className="customer-select-field__meta">
                        {customer.authorizedPerson}
                      </span>
                    )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      </Form.Group>
    </div>
  );
}
