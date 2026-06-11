"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ResponsiveTableWrapper from "@/components/ui/ResponsiveTableWrapper";
import CustomerActionButtons from "./CustomerActionButtons";

function StatusBodyTemplate({ active }) {
  const isActive = active !== false;

  return (
    <span
      className={`badge rounded-pill ${
        isActive ? "text-bg-primary" : "text-bg-secondary"
      }`}
    >
      {isActive ? "Aktif" : "Pasif"}
    </span>
  );
}

export default function CustomersDesktopTable({
  customers = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  busy = false,
  deletingId = null,
}) {
  function actionBodyTemplate(rowData) {
    return (
      <CustomerActionButtons
        onView={() => onView?.(rowData)}
        onEdit={() => onEdit?.(rowData)}
        onDelete={() => onDelete?.(rowData)}
        showEdit={showEdit}
        showDelete={showDelete}
        disabled={busy}
        deleting={deletingId === rowData.id}
      />
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <ResponsiveTableWrapper minWidth={760}>
          <DataTable
            value={customers}
            paginator
            rows={10}
            stripedRows
            removableSort
            loading={loading}
            responsiveLayout="scroll"
            className="p-datatable-lg"
            emptyMessage="Müşteri bulunamadı."
          >
            <Column field="companyName" header="Şirket Adı" sortable />
            <Column
              field="authorizedPerson"
              header="Yetkili Kişi"
              sortable
            />
            <Column field="phone" header="Telefon" />
            <Column field="taxNumber" header="Vergi No" sortable />
            <Column
              field="active"
              header="Durum"
              body={(row) => <StatusBodyTemplate active={row.active} />}
            />
            <Column
              header="İşlemler"
              body={actionBodyTemplate}
              style={{ minWidth: "280px" }}
            />
          </DataTable>
        </ResponsiveTableWrapper>
      </div>
    </div>
  );
}
