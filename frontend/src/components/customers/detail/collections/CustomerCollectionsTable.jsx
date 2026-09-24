"use client";

import { Table } from "react-bootstrap";
import CustomerCollectionsTableRow from "./CustomerCollectionsTableRow";

export default function CustomerCollectionsTable({
  collections,
  onSelect,
  onEdit,
  onDelete,
  onMarkAsPaid,
  busy = false,
}) {
  return (
    <div className="customer-collections-table-wrapper">
      <Table
        hover
        responsive={false}
        className="customer-collections-table align-middle mb-0"
      >
        <thead>
          <tr>
            <th>Tutar</th>
            <th>Ödeme Türü</th>
            <th>Durum</th>
            <th className="d-none d-xl-table-cell">Tahsilat Tarihi</th>
            <th>Vade Tarihi</th>
            <th>Kalan / Geciken</th>
            <th className="d-none d-xl-table-cell">Açıklama</th>
            <th className="text-end">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => (
            <CustomerCollectionsTableRow
              key={collection.id}
              collection={collection}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkAsPaid={onMarkAsPaid}
              busy={busy}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
}
