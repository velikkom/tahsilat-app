"use client";

import { Table, Badge, Button } from "react-bootstrap";
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
      <Table hover responsive={false} className="customer-collections-table align-middle mb-0">
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
          {collections.map((collection) => {
            const status = getEffectiveStatus(collection);
            const canMarkAsPaid =
              status === "PENDING" || status === "OVERDUE";

            return (
              <tr
                key={collection.id}
                role="button"
                onClick={() => onSelect(collection)}
              >
                <td className="fw-bold">{formatCurrency(collection.amount)}</td>

                <td>{getPaymentTypeLabel(collection.paymentType)}</td>

                <td>
                  <Badge bg={getStatusVariant(status)}>
                    {getStatusLabel(status)}
                  </Badge>
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
                  <div className="d-inline-flex gap-1">
                    {canMarkAsPaid && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        disabled={busy}
                        onClick={() => onMarkAsPaid(collection)}
                        title="Tahsil Edildi olarak işaretle"
                      >
                        <i className="pi pi-check" aria-hidden="true" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline-warning"
                      disabled={busy}
                      onClick={() => onEdit(collection)}
                      title="Düzenle"
                      aria-label="Tahsilat düzenle"
                    >
                      <i className="pi pi-pencil" aria-hidden="true" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={busy}
                      onClick={() => onDelete(collection)}
                      title="Sil"
                      aria-label="Tahsilat sil"
                    >
                      <i className="pi pi-trash" aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
