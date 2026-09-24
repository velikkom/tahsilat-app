"use client";

import { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { EMPTY_CUSTOMER_FILTERS } from "@/utils/customerUtils";
import useOffcanvasPlacement from "@/hooks/useOffcanvasPlacement";
import CustomerFiltersDrawerForm from "./CustomerFiltersDrawerForm";

export default function CustomerFiltersDrawer({
  show,
  filters,
  onHide,
  onApply,
  onReset,
}) {
  const [draft, setDraft] = useState(EMPTY_CUSTOMER_FILTERS);
  const placement = useOffcanvasPlacement("(max-width: 991px)");

  useEffect(() => {
    if (show) {
      setDraft(filters);
    }
  }, [show, filters]);

  function handleChange(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleApply() {
    onApply?.(draft);
    onHide?.();
  }

  function handleReset() {
    setDraft(EMPTY_CUSTOMER_FILTERS);
    onReset?.();
    onHide?.();
  }

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement={placement}
      className={`customer-filters-drawer ${
        placement === "bottom" ? "customer-filters-drawer--bottom" : ""
      }`}
    >
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title>Filtrele</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column gap-3">
        <CustomerFiltersDrawerForm
          draft={draft}
          onChange={handleChange}
          onReset={handleReset}
          onApply={handleApply}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
