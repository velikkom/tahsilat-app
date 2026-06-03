"use client";

import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useCustomerCollections from "@/hooks/useCustomerCollections";

export default function CustomerCollectionsTable({ customer }) {
  
  const { collections, loading } = useCustomerCollections(customer.id);

  function statusBodyTemplate(rowData) {
    return (
      <Tag
        value={rowData.status}
        severity={rowData.status === "PAID" ? "success" : "warning"}
      />
    );
  }

  function paymentTypeTemplate(rowData) {
    return (
      <Tag
        value={rowData.paymentType}
        severity={rowData.paymentType === "CASH" ? "success" : "info"}
      />
    );
  }

  function amountTemplate(rowData) {
    return new Intl.NumberFormat(
      "tr-TR",

      {
        style: "currency",

        currency: "TRY",
      }
    ).format(rowData.amount);
  }
  console.log(collections);

  return (
    <div
      className="
                card
                border-0
                shadow-sm
            "
    >
      <div className="card-body">
        <h5
          className="
                        fw-bold
                        mb-4
                    "
        >
          Collection History
        </h5>

        <DataTable
          value={collections}
          loading={loading}
          paginator
          rows={10}
          stripedRows
          responsiveLayout="scroll"
          emptyMessage="
                        No collections found.
                    "
        >
          <Column field="amount" header="Amount" body={amountTemplate} />

          <Column
            field="paymentType"
            header="Payment Type"
            body={paymentTypeTemplate}
          />

          <Column field="status" header="Status" body={statusBodyTemplate} />

          <Column field="collectionDate" header="Collection Date" />

          <Column field="maturityDate" header="Maturity Date" />
        </DataTable>
      </div>
    </div>
  );
}
