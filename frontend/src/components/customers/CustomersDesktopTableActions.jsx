"use client";

import { Badge } from "react-bootstrap";
import CustomerActionButtons from "./CustomerActionButtons";
import {
  getCustomerStatusLabel,
  getCustomerStatusVariant,
} from "@/utils/customerUtils";

export function CustomerStatusBadge({ customer }) {
  return (
    <Badge bg={getCustomerStatusVariant(customer)}>
      {getCustomerStatusLabel(customer)}
    </Badge>
  );
}


export default function CustomersDesktopTableActions({
  rowData,
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit,
  showDelete,
  busy,
  deletingId,
}) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
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
    </div>
  );
}
