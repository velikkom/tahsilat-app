"use client";

import { memo } from "react";
import { Button } from "react-bootstrap";
import { FaFileExcel, FaPlus } from "react-icons/fa";

function CollectionPageActions({
  onCreate,
  onImport,
  disabled = false,
}) {
  return (
    <div className="collection-page-actions d-flex flex-column flex-md-row gap-2 mb-3">
      <Button
        variant="primary"
        className="collection-page-actions__create touch-target flex-md-grow-0"
        onClick={onCreate}
        disabled={disabled}
      >
        <FaPlus className="me-2" aria-hidden="true" />
        Yeni Tahsilat
      </Button>

      <Button
        variant="outline-secondary"
        className="collection-page-actions__import touch-target"
        onClick={onImport}
        disabled={disabled}
      >
        <FaFileExcel className="me-2" aria-hidden="true" />
        Excel Import
      </Button>
    </div>
  );
}

export default memo(CollectionPageActions);
