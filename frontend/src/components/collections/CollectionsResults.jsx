"use client";

import { Spinner } from "react-bootstrap";
import CollectionTable from "@/components/collections/CollectionTable";
import CollectionCardGrid from "@/components/collections/CollectionCardGrid";
import CollectionEmptyState from "@/components/collections/CollectionEmptyState";

export default function CollectionsResults({
  loading,
  hasCollections,
  filteredCollections,
  collectionsCount,
  customerMap,
  onCreate,
  onClearFilters,
  onView,
  onEdit,
  onDelete,
  onMarkAsPaid,
  isBusy,
  deletingId,
}) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!hasCollections) {
    return <CollectionEmptyState onCreate={onCreate} />;
  }

  if (filteredCollections.length === 0) {
    return (
      <CollectionEmptyState filtered onClearFilters={onClearFilters} />
    );
  }

  return (
    <>
      <div className="d-none d-lg-block">
        <CollectionTable
          collections={filteredCollections}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
          disabled={isBusy}
          deletingId={deletingId}
        />
      </div>
      <div className="d-lg-none">
        <CollectionCardGrid
          collections={filteredCollections}
          customerMap={customerMap}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
          disabled={isBusy}
          deletingId={deletingId}
        />
      </div>
      <div className="text-muted small mt-3">
        {filteredCollections.length} / {collectionsCount} kayıt gösteriliyor
      </div>
    </>
  );
}
