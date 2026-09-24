"use client";

import { useCallback } from "react";
import { DataTable } from "primereact/datatable";
import CollectionSearch from "./CollectionSearch";
import CollectionActions from "./CollectionActions";
import getCollectionsTableColumns from "./CollectionsTableColumns";
import ResponsiveTableWrapper from "@/components/ui/ResponsiveTableWrapper";
import useCollectionFilters from "@/hooks/useCollectionFilters";

export default function CollectionsTable({
  collections = [],
  loading = false,
  onEdit,
  onDelete,
  actionsDisabled = false,
  deletingId = null,
}) {
  const {
    filters,
    setFilters,
    globalFilterValue,
    clearFilter,
    onGlobalFilterChange,
  } = useCollectionFilters();

  const actionsBodyTemplate = useCallback(
    (rowData) => (
      <CollectionActions
        row={rowData}
        onEdit={onEdit}
        onDelete={onDelete}
        disabled={actionsDisabled}
        deletingId={deletingId}
      />
    ),
    [onEdit, onDelete, actionsDisabled, deletingId]
  );

  const header = (
    <CollectionSearch
      globalFilterValue={globalFilterValue}
      onGlobalFilterChange={onGlobalFilterChange}
      clearFilter={clearFilter}
    />
  );

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <ResponsiveTableWrapper minWidth={960}>
          <DataTable
            value={collections}
            paginator
            rows={10}
            stripedRows
            showGridlines
            loading={loading}
            dataKey="id"
            filters={filters}
            header={header}
            onFilter={(e) => setFilters(e.filters)}
            responsiveLayout="scroll"
            globalFilterFields={[
              "customerName",
              "paymentType",
              "status",
              "description",
            ]}
            emptyMessage="No collections found."
          >
            {getCollectionsTableColumns(actionsBodyTemplate)}
          </DataTable>
        </ResponsiveTableWrapper>
      </div>
    </div>
  );
}
