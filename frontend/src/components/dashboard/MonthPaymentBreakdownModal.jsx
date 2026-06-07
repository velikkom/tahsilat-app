"use client";

import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { getMonthPaymentBreakdown } from "@/services/dashboardService";
import {
  formatCurrency,
  formatPaymentType,
} from "@/utils/dashboardFormatters";

const ALL_PAYMENT_TYPES = [
  "CASH",
  "CREDIT_CARD",
  "CHECK",
  "PROMISSORY_NOTE",
  "BANK_TRANSFER",
];

export default function MonthPaymentBreakdownModal({
  show,
  onHide,
  year,
  month,
  monthName,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show || !year || !month) {
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError("");
        const result = await getMonthPaymentBreakdown(year, month);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [show, year, month]);

  const amountByType = Object.fromEntries(
    (data?.items || []).map((item) => [item.paymentType, item.totalAmount])
  );

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="responsive-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {monthName || data?.monthName} {year}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {error && <div className="alert alert-danger mb-0">{error}</div>}

        {!loading && !error && data && (
          <>
            <div className="mb-3">
              <strong>Toplam:</strong> {formatCurrency(data.totalAmount)}
            </div>
            <ul className="list-group list-group-flush">
              {ALL_PAYMENT_TYPES.map((type) => (
                <li
                  key={type}
                  className="list-group-item d-flex justify-content-between px-0"
                >
                  <span>{formatPaymentType(type)}</span>
                  <span>{formatCurrency(amountByType[type] ?? 0)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
