"use client";

import { Badge } from "react-bootstrap";
import {
  formatCurrency,
  formatDate,
  formatMaturityDays,
  getEffectiveStatus,
  getPaymentTypeLabel,
  getStatusLabel,
  getStatusVariant,
} from "@/utils/collectionUtils";
import CustomerCollectionsTableActions from "./CustomerCollectionsTableActions";

function MaturityDaysCell({ collection }) {
  const { text, tone } = formatMaturityDays(collection);
  return <span className={`fw-semibold text-${tone}`}>{text}</span>;
}

export default function CustomerCollectionsTableRow({
  collection,
  onSelect,
  onEdit,
  onDelete,
  onMarkAsPaid,
  busy,
}) {
  const status = getEffectiveStatus(collection);

  return (
    <tr role="button" onClick={() => onSelect(collection)}>
      <td className="fw-bold">{formatCurrency(collection.amount)}</td>
      <td>{getPaymentTypeLabel(collection.paymentType)}</td>
      <td>
        <Badge bg={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
      </td>
      <td className="d-none d-xl-table-cell">
        {formatDate(collection.collectionDate)}
      </td>
      <td>{formatDate(collection.maturityDate)}</td>
      <td>
        <MaturityDaysCell collection={collection} />
      </td>
      <td className="d-none d-xl-table-cell">
        <span
          className="customer-collections-table__description text-muted"
          title={collection.description || ""}
        >
          {collection.description || "-"}
        </span>
      </td>
      <td className="text-end" onClick={(e) => e.stopPropagation()}>
        <CustomerCollectionsTableActions
          collection={collection}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
          busy={busy}
        />
      </td>
    </tr>
  );
}
