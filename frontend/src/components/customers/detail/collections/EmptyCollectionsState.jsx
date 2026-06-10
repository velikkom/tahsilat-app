"use client";

import { Button } from "react-bootstrap";

export default function EmptyCollectionsState({
  filtered = false,
  onCreate,
  onClearFilters,
}) {
  if (filtered) {
    return (
      <div className="customer-collections-empty text-center py-5">
        <i
          className="pi pi-filter-slash customer-collections-empty__icon text-muted"
          aria-hidden="true"
        />
        <p className="fw-semibold mb-1 mt-3">
          Filtrelere uygun tahsilat bulunamadı
        </p>
        <p className="text-muted small mb-3">
          Arama veya filtre kriterlerini değiştirmeyi deneyin.
        </p>
        <Button variant="outline-secondary" size="sm" onClick={onClearFilters}>
          Filtreleri Temizle
        </Button>
      </div>
    );
  }

  return (
    <div className="customer-collections-empty text-center py-5">
      <i
        className="pi pi-inbox customer-collections-empty__icon text-muted"
        aria-hidden="true"
      />
      <p className="fw-semibold mb-1 mt-3">Tahsilat bulunamadı</p>
      <p className="text-muted small mb-3">
        Bu müşteri için henüz tahsilat kaydı oluşturulmamış.
      </p>
      <Button variant="primary" onClick={onCreate}>
        <i className="pi pi-plus me-2" aria-hidden="true" />
        İlk Tahsilatı Oluştur
      </Button>
    </div>
  );
}
