"use client";

import { Button, ButtonGroup } from "react-bootstrap";

export default function CustomerCollectionsViewToggle({ viewMode, onChange }) {
  return (
    <ButtonGroup size="sm">
      <Button
        variant={viewMode === "TABLE" ? "primary" : "outline-secondary"}
        onClick={() => onChange("TABLE")}
      >
        <i className="pi pi-table me-1" aria-hidden="true" />
        Tablo
      </Button>
      <Button
        variant={viewMode === "TIMELINE" ? "primary" : "outline-secondary"}
        onClick={() => onChange("TIMELINE")}
      >
        <i className="pi pi-sort-amount-down me-1" aria-hidden="true" />
        Timeline
      </Button>
    </ButtonGroup>
  );
}
