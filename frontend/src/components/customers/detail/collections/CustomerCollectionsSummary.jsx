"use client";

import { formatCurrency, formatDate } from "@/utils/collectionUtils";

const CARD_DEFINITIONS = [
  {
    key: "totalAmount",
    label: "Toplam Tahsilat",
    icon: "pi pi-wallet",
    tone: "primary",
    render: (summary) => formatCurrency(summary.totalAmount),
  },
  {
    key: "pendingAmount",
    label: "Bekleyen Tahsilatlar",
    icon: "pi pi-clock",
    tone: "warning",
    render: (summary) => formatCurrency(summary.pendingAmount),
  },
  {
    key: "overdueAmount",
    label: "Vadesi Geçen Tahsilatlar",
    icon: "pi pi-exclamation-triangle",
    tone: "danger",
    render: (summary) => formatCurrency(summary.overdueAmount),
  },
  {
    key: "paidAmount",
    label: "Tahsil Edilen",
    icon: "pi pi-check-circle",
    tone: "success",
    render: (summary) => formatCurrency(summary.paidAmount),
  },
  {
    key: "totalCount",
    label: "Toplam Kayıt Sayısı",
    icon: "pi pi-list",
    tone: "info",
    render: (summary) => summary.totalCount,
  },
  {
    key: "averageAmount",
    label: "Ortalama Tahsilat",
    icon: "pi pi-chart-line",
    tone: "info",
    render: (summary) => formatCurrency(summary.averageAmount),
  },
  {
    key: "maxAmount",
    label: "En Büyük Tahsilat",
    icon: "pi pi-arrow-up-right",
    tone: "primary",
    render: (summary) => formatCurrency(summary.maxAmount),
  },
  {
    key: "lastCollectionDate",
    label: "Son Tahsilat Tarihi",
    icon: "pi pi-calendar",
    tone: "secondary",
    render: (summary) => formatDate(summary.lastCollectionDate),
  },
];

export default function CustomerCollectionsSummary({ summary }) {
  return (
    <div className="row row-cols-2 row-cols-md-2 row-cols-lg-4 g-2 g-md-3">
      {CARD_DEFINITIONS.map((card) => (
        <div className="col" key={card.key}>
          <div
            className={`customer-collections-summary-card customer-collections-summary-card--${card.tone} card border-0 shadow-sm h-100`}
          >
            <div className="card-body d-flex align-items-center gap-2 gap-md-3 p-2 p-md-3">
              <span
                className={`customer-collections-summary-card__icon text-${card.tone}`}
              >
                <i className={card.icon} aria-hidden="true" />
              </span>

              <div className="min-width-0">
                <div className="customer-collections-summary-card__label text-muted text-truncate">
                  {card.label}
                </div>
                <div className="customer-collections-summary-card__value fw-bold text-truncate">
                  {card.render(summary)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
