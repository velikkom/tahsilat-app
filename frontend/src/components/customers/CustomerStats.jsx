"use client";

import { memo } from "react";

const STAT_CARDS = [
  {
    key: "totalCount",
    label: "Toplam Müşteri",
    icon: "pi pi-users",
    tone: "primary",
  },
  {
    key: "activeCount",
    label: "Aktif Müşteri",
    icon: "pi pi-check-circle",
    tone: "success",
  },
  {
    key: "inactiveCount",
    label: "Pasif Müşteri",
    icon: "pi pi-ban",
    tone: "secondary",
  },
  {
    key: "thisMonthCount",
    label: "Bu Ay Eklenen",
    icon: "pi pi-calendar-plus",
    tone: "info",
  },
];

function CustomerStats({ stats }) {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-2 g-md-3 mb-3 mb-md-4">
      {STAT_CARDS.map((card) => (
        <div className="col" key={card.key}>
          <div
            className={`ui-stat-card ui-stat-card--${card.tone} card border-0 shadow-sm h-100`}
          >
            <div className="card-body d-flex align-items-center gap-3 p-3">
              <span
                className={`ui-stat-card__icon text-${card.tone}`}
                aria-hidden="true"
              >
                <i className={card.icon} />
              </span>

              <div className="min-width-0">
                <div className="ui-stat-card__label text-muted text-truncate">
                  {card.label}
                </div>
                <div className="ui-stat-card__value fw-bold text-truncate">
                  {stats?.[card.key] ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(CustomerStats);
