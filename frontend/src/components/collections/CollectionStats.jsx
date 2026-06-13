"use client";

import { memo } from "react";
import { formatCurrency } from "@/utils/collectionUtils";

const STAT_CARDS = [
  {
    key: "totalAmount",
    label: "Toplam Tahsilat",
    icon: "pi pi-wallet",
    tone: "primary",
  },
  {
    key: "thisMonthAmount",
    label: "Bu Ay",
    icon: "pi pi-calendar",
    tone: "info",
  },
  {
    key: "pendingAmount",
    label: "Bekleyen",
    icon: "pi pi-clock",
    tone: "warning",
  },
];

function CollectionStats({ stats }) {
  return (
    <div className="row row-cols-1 row-cols-sm-3 g-2 g-md-3 mb-3 mb-md-4">
      {STAT_CARDS.map((card) => (
        <div className="col" key={card.key}>
          <div
            className={`collection-stat-card collection-stat-card--${card.tone} card border-0 shadow-sm h-100`}
          >
            <div className="card-body d-flex align-items-center gap-3 p-3">
              <span
                className={`collection-stat-card__icon text-${card.tone}`}
                aria-hidden="true"
              >
                <i className={card.icon} />
              </span>

              <div className="min-width-0">
                <div className="collection-stat-card__label text-muted text-truncate">
                  {card.label}
                </div>
                <div className="collection-stat-card__value fw-bold text-truncate">
                  {formatCurrency(stats?.[card.key] ?? 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(CollectionStats);
