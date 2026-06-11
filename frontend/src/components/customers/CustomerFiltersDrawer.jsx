"use client";

import { useEffect, useState } from "react";
import { Button, Form, Offcanvas } from "react-bootstrap";
import {
  CUSTOMER_ACTIVE_FILTER,
  EMPTY_CUSTOMER_FILTERS,
} from "@/utils/customerUtils";

export default function CustomerFiltersDrawer({
  show,
  filters,
  onHide,
  onApply,
  onReset,
}) {
  const [draft, setDraft] = useState(EMPTY_CUSTOMER_FILTERS);
  const [placement, setPlacement] = useState("end");

  useEffect(() => {
    if (show) {
      setDraft(filters);
    }
  }, [show, filters]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 991px)");

    function updatePlacement() {
      setPlacement(mediaQuery.matches ? "bottom" : "end");
    }

    updatePlacement();
    mediaQuery.addEventListener("change", updatePlacement);

    return () => mediaQuery.removeEventListener("change", updatePlacement);
  }, []);

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
        <Form.Group>
          <Form.Label>Şirket adı</Form.Label>
          <Form.Control
            value={draft.companyName}
            onChange={(event) =>
              handleChange("companyName", event.target.value)
            }
            placeholder="Şirket adı"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Yetkili kişi</Form.Label>
          <Form.Control
            value={draft.authorizedPerson}
            onChange={(event) =>
              handleChange("authorizedPerson", event.target.value)
            }
            placeholder="Yetkili kişi"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Telefon</Form.Label>
          <Form.Control
            value={draft.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="Telefon"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Durum</Form.Label>
          <Form.Select
            value={draft.active}
            onChange={(event) => handleChange("active", event.target.value)}
          >
            <option value={CUSTOMER_ACTIVE_FILTER.ALL}>Tümü</option>
            <option value={CUSTOMER_ACTIVE_FILTER.ACTIVE}>Aktif</option>
            <option value={CUSTOMER_ACTIVE_FILTER.INACTIVE}>Pasif</option>
          </Form.Select>
        </Form.Group>

        <div className="customer-filters-drawer__actions d-grid gap-2 mt-auto">
          <Button
            variant="outline-secondary"
            className="touch-target"
            onClick={handleReset}
          >
            Sıfırla
          </Button>
          <Button
            variant="primary"
            className="touch-target"
            onClick={handleApply}
          >
            Uygula
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
