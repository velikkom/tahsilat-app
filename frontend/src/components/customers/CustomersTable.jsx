"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import CustomersSearch from "./CustomersSearch";
import useCustomers from "@/hooks/useCustomers";

export default function CustomersTable() {
  const router = useRouter();

  const { customers, loading } = useCustomers();

  const [filters, setFilters] = useState({
    global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  function onGlobalFilterChange(e) {
    const value = e.target.value;

    let _filters = {
      ...filters,
    };

    _filters["global"].value = value;

    setFilters(_filters);

    setGlobalFilterValue(value);
  }

  function actionBodyTemplate(rowData) {
    return (
      <button
        className="
                    btn
                    btn-outline-primary
                    btn-sm
                "
        onClick={() => router.push(`/customers/${rowData.id}`)}
      >
        <i className="pi pi-eye" />
      </button>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <CustomersSearch
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
        />

        <DataTable
          value={customers}
          paginator
          rows={10}
          stripedRows
          removableSort
          loading={loading}
          responsiveLayout="scroll"
          className="
                        p-datatable-lg
                    "
          filters={filters}
          globalFilterFields={[
            "companyName",

            "authorizedPerson",

            "phone",

            "taxNumber",
          ]}
          tableStyle={{
            minWidth: "100%",
          }}
        >
          <Column field="companyName" header="Company Name" sortable />

          <Column
            field="
                            authorizedPerson
                        "
            header="
                            Authorized Person
                        "
            sortable
          />

          <Column field="phone" header="Phone" />

          <Column field="taxNumber" header="Tax Number" sortable />

          <Column
            header="Actions"
            body={actionBodyTemplate}
            style={{
              width: "120px",
            }}
          />
        </DataTable>
      </div>
    </div>
  );
}
