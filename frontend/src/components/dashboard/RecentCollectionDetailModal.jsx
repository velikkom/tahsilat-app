"use client";

import { Modal } from "react-bootstrap";
import {
  formatCurrency,
  formatPaymentType,
} from "@/utils/dashboardFormatters";

export default function RecentCollectionDetailModal({ show, onHide, collection }) {
  if (!collection) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="responsive-modal">
      <Modal.Header closeButton>
        <Modal.Title>Tahsilat Detayı</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <dl className="row mb-0">
          <dt className="col-sm-4">Firma</dt>
          <dd className="col-sm-8">{collection.customerName}</dd>

          <dt className="col-sm-4">Tutar</dt>
          <dd className="col-sm-8">{formatCurrency(collection.amount)}</dd>

          <dt className="col-sm-4">Ödeme Türü</dt>
          <dd className="col-sm-8">
            {formatPaymentType(collection.paymentType)}
          </dd>

          <dt className="col-sm-4">Durum</dt>
          <dd className="col-sm-8">{collection.status}</dd>

          <dt className="col-sm-4">Tahsilat Tarihi</dt>
          <dd className="col-sm-8">{collection.collectionDate}</dd>

          {collection.maturityDate && (
            <>
              <dt className="col-sm-4">Vade Tarihi</dt>
              <dd className="col-sm-8">{collection.maturityDate}</dd>
            </>
          )}

          {collection.description && (
            <>
              <dt className="col-sm-4">Açıklama</dt>
              <dd className="col-sm-8">{collection.description}</dd>
            </>
          )}
        </dl>
      </Modal.Body>
    </Modal>
  );
}
