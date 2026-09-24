import { Column } from "primereact/column";
import {
  amountBodyTemplate,
  paymentTypeBodyTemplate,
  statusBodyTemplate,
} from "./CollectionTemplates";
import {
  amountFilterTemplate,
  dateFilterTemplate,
  paymentTypeFilterTemplate,
  statusFilterTemplate,
} from "./collectionTableFilters";

export default function getCollectionsTableColumns(actionsBodyTemplate) {
  return [
    <Column key="customerName" field="customerName" header="Customer" sortable filter />,
    <Column
      key="amount"
      field="amount"
      header="Amount"
      sortable
      body={amountBodyTemplate}
      filter
      filterElement={amountFilterTemplate}
    />,
    <Column
      key="paymentType"
      field="paymentType"
      header="Payment Type"
      sortable
      body={paymentTypeBodyTemplate}
      filter
      filterElement={paymentTypeFilterTemplate}
    />,
    <Column
      key="status"
      field="status"
      header="Status"
      sortable
      body={statusBodyTemplate}
      filter
      filterElement={statusFilterTemplate}
    />,
    <Column
      key="collectionDate"
      field="collectionDate"
      header="Collection Date"
      sortable
      filter
      dataType="date"
      filterElement={dateFilterTemplate}
    />,
    <Column key="maturityDate" field="maturityDate" header="Maturity Date" sortable />,
    <Column
      key="actions"
      header="Actions"
      body={actionsBodyTemplate}
      style={{ width: "160px", minWidth: "160px" }}
    />,
  ];
}
