"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Form } from "react-bootstrap";

import {
  filterMailOrderCompanies,
  toTurkishUpperCase,
} from "@/utils/collectionUtils";

export default function MailOrderCompanyField({
  value,
  onChange,
  companies = [],
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const suggestions = useMemo(
    () => filterMailOrderCompanies(companies, value),
    [companies, value]
  );

  useEffect(() => {
    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleInputChange(event) {
    onChange(toTurkishUpperCase(event.target.value));
    setOpen(true);
  }

  function handleSelect(name) {
    onChange(toTurkishUpperCase(name));
    setOpen(false);
  }

  return (
    <Form.Group className="mail-order-company-field" ref={wrapperRef}>
      <Form.Label>Mailorder Firma</Form.Label>
      <Form.Control
        type="text"
        name="mailOrderCompany"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder="Firma adı yazın"
      />

      {open && suggestions.length > 0 && (
        <ul className="mail-order-company-field__list" role="listbox">
          {suggestions.map((company) => (
            <li key={company}>
              <button
                type="button"
                className="mail-order-company-field__option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(company)}
              >
                {company}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Form.Group>
  );
}
