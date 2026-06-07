"use client";

import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { getPaymentTypeCustomers } from "@/services/dashboardService";
import {
  formatCurrency,
  formatPaymentType,
} from "@/utils/dashboardFormatters";

export default function PaymentTypeCustomersModal({
  show,
  onHide,
  paymentType,
  year,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show || !paymentType) {
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError("");
        const result = await getPaymentTypeCustomers(paymentType, year, 10);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [show, paymentType, year]);

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="responsive-modal">
      <Modal.Header closeButton>
        <Modal.Title>{formatPaymentType(paymentType)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {error && <div className="alert alert-danger mb-0">{error}</div>}

        {!loading && !error && (
          <ul className="list-group list-group-flush">
            {(data?.customers || []).length === 0 ? (
              <li className="list-group-item px-0 text-muted">
                Bu ödeme türü için firma bulunamadı.
              </li>
            ) : (
              data.customers.map((customer) => (
                <li
                  key={customer.customerId}
                  className="list-group-item d-flex justify-content-between align-items-start gap-2 px-0"
                >
                  <span className="text-break">{customer.companyName}</span>
                  <strong className="flex-shrink-0">
                    {formatCurrency(customer.totalAmount)}
                  </strong>
                </li>
              ))
            )}
          </ul>
        )}
      </Modal.Body>
    </Modal>
  );
}
