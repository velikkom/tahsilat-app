"use client";

import { memo } from "react";
import { Button } from "react-bootstrap";

function CollectionEmptyState({
  filtered = false,
  onCreate,
  onClearFilters,
}) {
  return (
    <div className="collection-empty-state text-center py-5 px-3">
      <i
        className="pi pi-inbox collection-empty-state__icon text-muted mb-3"
        aria-hidden="true"
      />

      <h3 className="h5 fw-semibold mb-2">
        {filtered ? "Sonuç bulunamadı" : "Henüz tahsilat yok"}
      </h3>

      <p className="text-muted mb-4">
        {filtered
          ? "Filtreleri değiştirerek tekrar deneyin."
          : "İlk tahsilat kaydınızı oluşturarak başlayın."}
      </p>

      {filtered ? (
        <Button variant="outline-secondary" onClick={onClearFilters}>
          Filtreleri Temizle
        </Button>
      ) : (
        <Button variant="primary" onClick={onCreate}>
          <i className="pi pi-plus me-2" aria-hidden="true" />
          Yeni Tahsilat
        </Button>
      )}
    </div>
  );
}

export default memo(CollectionEmptyState);
