"use client";

import { Button } from "react-bootstrap";

export default function CollectionsActionsBar({
  onImport,
  onCreate,
  disabled = false,
}) {
  return (
    <div className="d-flex flex-column flex-sm-row justify-content-end collections-actions-bar mb-3">
      <Button
        variant="outline-secondary"
        onClick={onImport}
        disabled={disabled}
        className="touch-target"
      >
        Excel Import
      </Button>
      <Button onClick={onCreate} disabled={disabled} className="touch-target">
        Yeni Tahsilat
      </Button>
    </div>
  );
}
