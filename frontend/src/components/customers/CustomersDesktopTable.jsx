"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "react-bootstrap";
import ResponsiveTableWrapper from "@/components/ui/ResponsiveTableWrapper";
import CustomerActionButtons from "./CustomerActionButtons";
import {
  getCustomerStatusLabel,
  getCustomerStatusVariant,
} from "@/utils/customerUtils";

function StatusBodyTemplate({ customer }) {
  return (
    <Badge bg={getCustomerStatusVariant(customer)}>
      {getCustomerStatusLabel(customer)}
    </Badge>
  );
}

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
  function actionBodyTemplate(rowData) {
    return (
      <CustomerActionButtons
        onView={() => onView?.(rowData)}
        onEdit={() => onEdit?.(rowData)}
        onDelete={() => onDelete?.(rowData)}
        onNewCollection={
          onNewCollection ? () => onNewCollection(rowData) : undefined
        }
        showEdit={showEdit}
        showDelete={showDelete}
        disabled={busy}
        deleting={deletingId === rowData.id}
        compact
      />
    );
  }

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
              body={(row) => <StatusBodyTemplate customer={row} />}
            />
            <Column
              header="İşlemler"
              body={actionBodyTemplate}
              style={{ minWidth: "420px" }}
            />
          </DataTable>
        </ResponsiveTableWrapper>
    </div>
  );
}
