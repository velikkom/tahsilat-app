"use client";

import { Badge } from "react-bootstrap";
import {
  formatCurrency,
  formatDate,
  getEffectiveStatus,
  getPaymentTypeLabel,
  getStatusLabel,
  getStatusVariant,
  groupCollectionsByMonth,
} from "@/utils/collectionUtils";

export default function CustomerCollectionsTimeline({
  collections,
  onSelect,
}) {
  const groups = groupCollectionsByMonth(collections);

  return (
    <div className="customer-collections-timeline d-flex flex-column gap-4">
      {groups.map((group) => (
        <section key={group.key}>
          <h6 className="customer-collections-timeline__month fw-bold text-uppercase mb-3">
            {group.label}
          </h6>

          <div className="customer-collections-timeline__items d-flex flex-column">
            {group.items.map((collection) => {
              const status = getEffectiveStatus(collection);

              return (
                <button
                  type="button"
                  key={collection.id}
                  className="customer-collections-timeline__item text-start"
                  onClick={() => onSelect(collection)}
                >
                  <span className="customer-collections-timeline__dot" />

                  <div className="d-flex flex-column flex-sm-row justify-content-between gap-1 gap-sm-3 w-100 min-width-0">
                    <div className="d-flex flex-column min-width-0">
                      <span className="fw-bold">
                        {formatCurrency(collection.amount)}{" "}
                        <span className="fw-normal text-muted">
                          {getPaymentTypeLabel(collection.paymentType)}
                        </span>
                      </span>

                      <span className="text-muted small">
                        {formatDate(collection.collectionDate)}
                        {collection.maturityDate &&
                          ` • Vade: ${formatDate(collection.maturityDate)}`}
                      </span>
                    </div>

                    <div className="flex-shrink-0">
                      <Badge bg={getStatusVariant(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
