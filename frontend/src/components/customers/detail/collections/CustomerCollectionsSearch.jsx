"use client";

import { Form, InputGroup, Button } from "react-bootstrap";

export default function CustomerCollectionsSearch({ value, onChange }) {
  return (
    <InputGroup className="customer-collections-search">
      <InputGroup.Text className="bg-transparent border-end-0">
        <i className="pi pi-search text-muted" aria-hidden="true" />
      </InputGroup.Text>

      <Form.Control
        type="search"
        className="border-start-0"
        placeholder="Açıklama, ödeme türü veya tutar ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Tahsilat ara"
      />

      {value && (
        <Button
          variant="outline-secondary"
          onClick={() => onChange("")}
          aria-label="Aramayı temizle"
        >
          <i className="pi pi-times" aria-hidden="true" />
        </Button>
      )}
    </InputGroup>
  );
}
