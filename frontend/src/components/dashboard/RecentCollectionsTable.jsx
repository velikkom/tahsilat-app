"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useRecentCollections } from "@/hooks/useDashboardMetrics";
import ResponsiveTableWrapper from "@/components/ui/ResponsiveTableWrapper";
import {
  amountBodyTemplate,
  paymentTypeBodyTemplate,
  statusBodyTemplate,
} from "@/components/collections/CollectionTemplates";
import DashboardWidget from "./DashboardWidget";

export default function RecentCollectionsTable() {
  const { data, loading, error, refresh } = useRecentCollections(10);

  return (
    <DashboardWidget
      title="Son Tahsilatlar"
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      <ResponsiveTableWrapper minWidth={640}>
        <DataTable
          value={data?.collections || []}
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
    </DashboardWidget>
  );
}
