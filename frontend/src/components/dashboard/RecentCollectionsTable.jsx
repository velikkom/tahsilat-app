"use client";

import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useDashboardYear from "@/context/DashboardYearContext";
import { useRecentCollections } from "@/hooks/useDashboardMetrics";
import ResponsiveTableWrapper from "@/components/ui/ResponsiveTableWrapper";
import {
  amountBodyTemplate,
  paymentTypeBodyTemplate,
  statusBodyTemplate,
} from "@/components/collections/CollectionTemplates";
import DashboardWidget from "./DashboardWidget";
import RecentCollectionCard from "./RecentCollectionCard";
import RecentCollectionDetailModal from "./RecentCollectionDetailModal";

export default function RecentCollectionsTable() {
  const { year } = useDashboardYear();
  const { data, loading, error, refresh } = useRecentCollections(10, year);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const collections = data?.collections || [];

  return (
    <>
      <DashboardWidget
        title="Son Tahsilatlar"
        loading={loading}
        error={error}
        onRetry={refresh}
      >
        <div className="d-md-none d-flex flex-column gap-3">
          {collections.length === 0 ? (
            <div className="text-muted text-center py-3">
              Henüz tahsilat kaydı bulunmuyor.
            </div>
          ) : (
            collections.map((collection) => (
              <RecentCollectionCard
                key={collection.id}
                collection={collection}
                onDetail={setSelectedCollection}
              />
            ))
          )}
        </div>

        <div className="d-none d-md-block">
          <ResponsiveTableWrapper minWidth={640}>
            <DataTable
              value={collections}
              stripedRows
              showGridlines
              emptyMessage="Henüz tahsilat kaydı bulunmuyor."
              size="small"
              responsiveLayout="scroll"
            >
              <Column field="customerName" header="Firma" sortable />
              <Column
                field="amount"
                header="Tutar"
                body={amountBodyTemplate}
                sortable
              />
              <Column
                field="paymentType"
                header="Ödeme Türü"
                body={paymentTypeBodyTemplate}
              />
              <Column field="status" header="Durum" body={statusBodyTemplate} />
              <Column field="collectionDate" header="Tahsilat Tarihi" sortable />
            </DataTable>
          </ResponsiveTableWrapper>
        </div>
      </DashboardWidget>

      <RecentCollectionDetailModal
        show={Boolean(selectedCollection)}
        onHide={() => setSelectedCollection(null)}
        collection={selectedCollection}
      />
    </>
  );
}
