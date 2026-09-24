"use client";

import { memo } from "react";
import { Table } from "react-bootstrap";
import CollectionTableRow from "./CollectionTableRow";

function CollectionTable({
  collections = [],
  onView,
  onEdit,
  onDelete,
  onMarkAsPaid,
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
          {collections.map((collection) => (
            <CollectionTableRow
              key={collection.id}
              collection={collection}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkAsPaid={onMarkAsPaid}
              disabled={disabled}
              deletingId={deletingId}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default memo(CollectionTable);
