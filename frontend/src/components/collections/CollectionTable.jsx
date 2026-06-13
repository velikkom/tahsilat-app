"use client";

import { memo } from "react";
import { Badge, Table } from "react-bootstrap";
import CollectionActions from "./CollectionActions";
import {
  formatCurrency,
  formatDate,
  formatMaturityDays,
  getEffectiveStatus,
  getPaymentTypeLabel,
  getStatusLabel,
  getStatusVariant,
} from "@/utils/collectionUtils";

function MaturityDaysCell({ collection }) {
  const { text, tone } = formatMaturityDays(collection);
  return <span className={`fw-semibold text-${tone}`}>{text}</span>;
}

function CollectionTable({
  collections = [],
  onView,
  onEdit,
  onDelete,
  disabled = false,
  deletingId = null,
}) {
  return (
    <div className="collection-table-wrapper">
      <Table hover className="collection-table align-middle mb-0">
        <thead>
          <tr>
            <th>Müşteri</th>
            <th>Tutar</th>
            <th>Ödeme Tipi</th>
            <th>Durum</th>
            <th>Tahsilat Tarihi</th>
            <th>Vade Tarihi</th>
            <th>Kalan / Geciken</th>
            <th className="text-end">İşlemler</th>
          </tr>
        </thead>

        <tbody>
          {collections.map((collection) => {
            const status = getEffectiveStatus(collection);

            return (
              <tr key={collection.id}>
                <td>
                  <span className="collection-table__customer fw-semibold">
                    {collection.customerName || "-"}
                  </span>
                </td>

                <td className="fw-bold">{formatCurrency(collection.amount)}</td>

                <td>
                  <Badge bg="light" text="dark" className="collection-table__type-badge">
                    {getPaymentTypeLabel(collection.paymentType)}
                  </Badge>
                </td>

                <td>
                  <Badge bg={getStatusVariant(status)}>
                    {getStatusLabel(status)}
                  </Badge>
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
                    disabled={disabled}
                    deletingId={deletingId}
                    variant="table"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default memo(CollectionTable);
