"use client";

import CustomerCollectionCard from "./CustomerCollectionCard";
import CustomerCollectionsTable from "./CustomerCollectionsTable";
import CustomerCollectionsTimeline from "./CustomerCollectionsTimeline";
import EmptyCollectionsState from "./EmptyCollectionsState";

export default function CustomerCollectionsResults({
  hasCollections,
  hasFilteredResults,
  viewMode,
  isMobile,
  filteredCollections,
  collectionsCount,
  busy,
  onCreate,
  onClearFilters,
  onSelect,
  onEdit,
  onDelete,
  onMarkAsPaid,
}) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {!hasCollections ? (
          <EmptyCollectionsState onCreate={onCreate} />
        ) : !hasFilteredResults ? (
          <EmptyCollectionsState filtered onClearFilters={onClearFilters} />
        ) : viewMode === "TIMELINE" ? (
          <CustomerCollectionsTimeline
            collections={filteredCollections}
            onSelect={onSelect}
          />
        ) : isMobile ? (
          <div className="d-flex flex-column gap-2">
            {filteredCollections.map((collection) => (
              <CustomerCollectionCard
                key={collection.id}
                collection={collection}
                onSelect={onSelect}
                onMarkAsPaid={onMarkAsPaid}
                busy={busy}
              />
            ))}
          </div>
        ) : (
          <CustomerCollectionsTable
            collections={filteredCollections}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkAsPaid={onMarkAsPaid}
            busy={busy}
          />
        )}

        {hasCollections && hasFilteredResults && (
          <div className="text-muted small mt-3">
            {filteredCollections.length} / {collectionsCount} kayıt gösteriliyor
          </div>
        )}
      </div>
    </div>
  );
}
