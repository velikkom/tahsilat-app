"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import CustomersSearch from "./CustomersSearch";
import ResponsiveTableWrapper from "@/components/ui/ResponsiveTableWrapper";
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
    const _filters = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  }

  function actionBodyTemplate(rowData) {
    return (
      <button
        type="button"
        className="btn btn-outline-primary btn-sm touch-target"
        onClick={() => router.push(`/customers/${rowData.id}`)}
        aria-label="Müşteri detayı"
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
            filters={filters}
            globalFilterFields={[
              "companyName",
              "authorizedPerson",
              "phone",
              "taxNumber",
            ]}
          >
            <Column field="companyName" header="Company Name" sortable />
            <Column
              field="authorizedPerson"
              header="Authorized Person"
              sortable
            />
            <Column field="phone" header="Phone" />
            <Column field="taxNumber" header="Tax Number" sortable />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              style={{ width: "100px", minWidth: "100px" }}
            />
          </DataTable>
        </ResponsiveTableWrapper>
      </div>
    </div>
  );
}
