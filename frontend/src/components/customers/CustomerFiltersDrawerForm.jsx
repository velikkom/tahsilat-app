"use client";

import { Button, Form } from "react-bootstrap";
import { CUSTOMER_ACTIVE_FILTER } from "@/utils/customerUtils";

export default function CustomerFiltersDrawerForm({
  draft,
  onChange,
  onReset,
  onApply,
}) {
  return (
    <>
      <Form.Group>
        <Form.Label>Şirket adı</Form.Label>
        <Form.Control
          value={draft.companyName}
          onChange={(event) => onChange("companyName", event.target.value)}
          placeholder="Şirket adı"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Yetkili kişi</Form.Label>
        <Form.Control
          value={draft.authorizedPerson}
          onChange={(event) => onChange("authorizedPerson", event.target.value)}
          placeholder="Yetkili kişi"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Telefon</Form.Label>
        <Form.Control
          value={draft.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          placeholder="Telefon"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Durum</Form.Label>
        <Form.Select
          value={draft.active}
          onChange={(event) => onChange("active", event.target.value)}
        >
          <option value={CUSTOMER_ACTIVE_FILTER.ALL}>Tümü</option>
          <option value={CUSTOMER_ACTIVE_FILTER.ACTIVE}>Aktif</option>
          <option value={CUSTOMER_ACTIVE_FILTER.INACTIVE}>Pasif</option>
        </Form.Select>
      </Form.Group>
      <div className="customer-filters-drawer__actions d-grid gap-2 mt-auto">
        <Button variant="outline-secondary" className="touch-target" onClick={onReset}>
          Sıfırla
        </Button>
        <Button variant="primary" className="touch-target" onClick={onApply}>
          Uygula
        </Button>
      </div>
    </>
  );
}
