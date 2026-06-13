"use client";

import { memo } from "react";
import CollectionCard from "./CollectionCard";

function CollectionCardGrid({
  collections = [],
  customerMap = {},
  onView,
  onEdit,
  onDelete,
  disabled = false,
  deletingId = null,
}) {
  return (
    <div className="row row-cols-1 row-cols-md-2 g-3">
      {collections.map((collection) => {
        const customer = customerMap[collection.customerId];

        return (
          <div className="col" key={collection.id}>
            <CollectionCard
              collection={collection}
              contactPerson={customer?.authorizedPerson || ""}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={disabled}
              deletingId={deletingId}
            />
          </div>
        );
      })}
    </div>
  );
}

export default memo(CollectionCardGrid);
