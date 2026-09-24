"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ResponsiveTableWrapper from "@/components/ui/ResponsiveTableWrapper";
import CustomersDesktopTableActions, {
  CustomerStatusBadge,
} from "./CustomersDesktopTableActions";

export default function CustomersDesktopTable({
  customers = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit = true,
  showDelete = true,
  busy = false,
  deletingId = null,
}) {
  return (
    <div className="customers-table-wrapper">
      <ResponsiveTableWrapper minWidth={760}>
        <DataTable
          value={customers}
          paginator
          rows={10}
          stripedRows
          removableSort
          loading={loading}
          responsiveLayout="scroll"
          className="p-datatable-lg customers-desktop-table"
          emptyMessage="Müşteri bulunamadı."
          rowClassName={() => "customers-desktop-table__row"}
          onRowDoubleClick={(event) => {
            if (event.data) onView?.(event.data);
          }}
        >
          <Column field="companyName" header="Şirket Adı" sortable />
          <Column field="authorizedPerson" header="Yetkili Kişi" sortable />
          <Column field="phone" header="Telefon" />
          <Column field="taxNumber" header="Vergi No" sortable />
          <Column
            field="active"
            header="Durum"
            body={(row) => <CustomerStatusBadge customer={row} />}
          />
          <Column
            header="İşlemler"
            style={{ minWidth: "420px" }}
            body={(rowData) => (
              <CustomersDesktopTableActions
                rowData={rowData}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onNewCollection={onNewCollection}
                showEdit={showEdit}
                showDelete={showDelete}
                busy={busy}
                deletingId={deletingId}
              />
            )}
          />
        </DataTable>
      </ResponsiveTableWrapper>
    </div>
  );
}
