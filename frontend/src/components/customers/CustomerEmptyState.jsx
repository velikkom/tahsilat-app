"use client";

import { memo } from "react";
import { Button } from "react-bootstrap";

function CustomerEmptyState({
  filtered = false,
  onCreate,
  onClearFilters,
  showCreate = true,
}) {
  return (
    <div className="ui-empty-state text-center py-5 px-3">
      <i
        className="pi pi-users ui-empty-state__icon text-muted mb-3"
        aria-hidden="true"
      />

      <h3 className="h5 fw-semibold mb-2">
        {filtered ? "Sonuç bulunamadı" : "Henüz müşteri yok"}
      </h3>

      <p className="text-muted mb-4">
        {filtered
          ? "Filtreleri değiştirerek tekrar deneyin."
          : "İlk müşteri kaydınızı oluşturarak başlayın."}
      </p>

      {filtered ? (
        <Button variant="outline-secondary" onClick={onClearFilters}>
          Filtreleri Temizle
        </Button>
      ) : showCreate ? (
        <Button variant="primary" onClick={onCreate}>
          <i className="pi pi-plus me-2" aria-hidden="true" />
          Yeni Müşteri
        </Button>
      ) : null}
    </div>
  );
}

export default memo(CustomerEmptyState);
