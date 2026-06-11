"use client";

import { Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

export default function CustomerSearchBar({
  value,
  onChange,
  placeholder = "Müşteri Ara",
}) {
  return (
    <InputGroup className="customer-search-bar">
      <InputGroup.Text className="customer-search-bar__icon bg-white border-end-0">
        <FaSearch aria-hidden="true" />
      </InputGroup.Text>
      <Form.Control
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="customer-search-bar__input border-start-0 shadow-none"
        aria-label={placeholder}
      />
    </InputGroup>
  );
}
