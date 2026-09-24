"use client";

import { Badge } from "react-bootstrap";
import CollectionActions from "./CollectionActions";
import PaymentTypeBadge from "./PaymentTypeBadge";
import {
  formatCurrency,
  formatDate,
  formatMaturityDays,
  getEffectiveStatus,
  getStatusLabel,
  getStatusVariant,
} from "@/utils/collectionUtils";

function MaturityDaysCell({ collection }) {
  const { text, tone } = formatMaturityDays(collection);
  return <span className={`fw-semibold text-${tone}`}>{text}</span>;
}

export default function CollectionTableRow({
  collection,
  onView,
  onEdit,
  onDelete,
  onMarkAsPaid,
  disabled,
  deletingId,
}) {
  const status = getEffectiveStatus(collection);

  return (
    <tr>
      <td>
        <span className="collection-table__customer fw-semibold">
          {collection.customerName || "-"}
        </span>
      </td>
      <td className="fw-bold">{formatCurrency(collection.amount)}</td>
      <td>
        <PaymentTypeBadge
          paymentType={collection.paymentType}
          className="collection-table__type-badge"
        />
      </td>
      <td>
        <Badge bg={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
      </td>
      <td>{formatDate(collection.collectionDate)}</td>
      <td>{formatDate(collection.maturityDate)}</td>
      <td>
        <MaturityDaysCell collection={collection} />
      </td>
      <td className="text-end">
        <CollectionActions
          row={collection}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
          disabled={disabled}
          deletingId={deletingId}
          variant="table"
        />
      </td>
    </tr>
  );
}
