"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";

import useCollections from "@/hooks/useCollections";
import useCollectionFilters from "@/hooks/useCollectionFilters";

import CollectionSearch from "./CollectionSearch";
import CollectionActions from "./CollectionActions";

import {
  amountBodyTemplate,
  paymentTypeBodyTemplate,
  statusBodyTemplate,
} from "./CollectionTemplates";

export default function CollectionsTable() {

  const {
    collections,
    loading,
  } = useCollections();

  const {
    filters,
    setFilters,
    globalFilterValue,
    clearFilter,
    onGlobalFilterChange,
  } = useCollectionFilters();

  const paymentTypes = [
    "CASH",
    "CHECK",
    "BANK_TRANSFER",
    "CREDIT_CARD",
  ];

  const statuses = [
    "PENDING",
    "PAID",
  ];

  function paymentTypeFilterTemplate(
    options
  ) {

    return (

      <Dropdown
        value={options.value}
        options={paymentTypes}
        onChange={(e) =>
          options.filterCallback(
            e.value
          )
        }
        placeholder="Select"
        className="p-column-filter"
        showClear
      />

    );
  }

  function statusFilterTemplate(
    options
  ) {

    return (

      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) =>
          options.filterCallback(
            e.value
          )
        }
        placeholder="Select"
        className="p-column-filter"
        showClear
      />

    );
  }

  function amountFilterTemplate(
    options
  ) {

    return (

      <InputNumber
        value={options.value}
        onChange={(e) =>
          options.filterCallback(
            e.value
          )
        }
        mode="currency"
        currency="TRY"
        locale="tr-TR"
      />

    );
  }

  function dateFilterTemplate(
    options
  ) {

    return (

      <Calendar
        value={options.value}
        onChange={(e) =>
          options.filterCallback(
            e.value
          )
        }
        dateFormat="dd/mm/yy"
      />

    );
  }

  const header = (

    <CollectionSearch

      globalFilterValue={
        globalFilterValue
      }

      onGlobalFilterChange={
        onGlobalFilterChange
      }

      clearFilter={
        clearFilter
      }

    />

  );

  return (

    <div
      className="
        card
        border-0
        shadow-sm
      "
    >

      <div className="card-body">

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

          onFilter={(e) =>
            setFilters(
              e.filters
            )
          }

          globalFilterFields={[
            "customerName",
            "paymentType",
            "status",
            "description",
          ]}

          emptyMessage="
            No collections found.
          "

        >

          <Column
            field="customerName"
            header="Customer"
            sortable
            filter
          />

          <Column
            field="amount"
            header="Amount"
            sortable
            body={
              amountBodyTemplate
            }
            filter
            filterElement={
              amountFilterTemplate
            }
          />

          <Column
            field="paymentType"
            header="Payment Type"
            sortable
            body={
              paymentTypeBodyTemplate
            }
            filter
            filterElement={
              paymentTypeFilterTemplate
            }
          />

          <Column
            field="status"
            header="Status"
            sortable
            body={
              statusBodyTemplate
            }
            filter
            filterElement={
              statusFilterTemplate
            }
          />

          <Column
            field="collectionDate"
            header="Collection Date"
            sortable
            filter
            dataType="date"
            filterElement={
              dateFilterTemplate
            }
          />

          <Column
            field="maturityDate"
            header="Maturity Date"
            sortable
          />

          <Column
            header="Actions"
            body={() =>
              <CollectionActions />
            }
            style={{
              width: "160px",
            }}
          />

        </DataTable>

      </div>

    </div>

  );
}