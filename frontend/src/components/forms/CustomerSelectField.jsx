"use client";

import { useRef } from "react";
import { Form } from "react-bootstrap";
import { customerDisplayName } from "@/utils/customerUtils";
import CustomerSelectSuggestions from "./CustomerSelectSuggestions";
import useCustomerSelectField from "./useCustomerSelectField";

export default function CustomerSelectField({
  value,
  onChange,
  customers = [],
  loading = false,
  disabled = false,
  validated = false,
}) {
  const wrapperRef = useRef(null);
  const field = useCustomerSelectField({
    value,
    onChange,
    customers,
    wrapperRef,
  });
  const showInvalid = validated && !value;
  const placeholder = loading ? "Müşteriler yükleniyor..." : "Müşteri adı yazın";

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
          value={field.query}
          onChange={field.handleInputChange}
          onFocus={() => field.setOpen(true)}
          onKeyDown={field.handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          isInvalid={showInvalid}
          aria-autocomplete="list"
          aria-expanded={field.open}
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
        {field.open && !disabled && (
          <CustomerSelectSuggestions
            loading={loading}
            value={value}
            suggestions={field.suggestions}
            onSelect={field.handleSelect}
          />
        )}
      </Form.Group>
    </div>
  );
}
