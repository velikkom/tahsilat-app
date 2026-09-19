"use client";

import Link from "next/link";
import { Badge, Button } from "react-bootstrap";
import { FaArrowLeft, FaEdit, FaMoneyBillWave, FaTrash } from "react-icons/fa";

import {
  formatCustomerField,
  getCustomerStatusLabel,
  getCustomerStatusVariant,
} from "@/utils/customerUtils";

export default function CustomerDetailHeader({
  customer,
  isAdmin = false,
  busy = false,
  onNewCollection,
  onEdit,
  onDelete,
}) {
  return (
    <div className="customer-detail-header d-flex flex-column gap-3">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
        <div className="min-width-0">
          <Link
            href="/customers"
            className="btn btn-outline-secondary touch-target d-inline-flex align-items-center gap-2 mb-3"
          >
            <FaArrowLeft aria-hidden="true" />
            Geri
          </Link>

          <div className="d-flex align-items-center flex-wrap gap-2">
            <h1 className="fw-bold page-header__title mb-0">
              {formatCustomerField(customer.companyName)}
            </h1>
            <Badge bg={getCustomerStatusVariant(customer)}>
              {getCustomerStatusLabel(customer)}
            </Badge>
          </div>

          <p className="text-muted mb-0 mt-1">
            {formatCustomerField(customer.authorizedPerson)}
          </p>
        </div>

        <div className="customer-detail-header__actions d-flex flex-column flex-sm-row flex-wrap gap-2">
          <Button
            variant="success"
            className="touch-target d-inline-flex align-items-center justify-content-center gap-2"
            disabled={busy}
            onClick={onNewCollection}
          >
            <FaMoneyBillWave aria-hidden="true" />
            Yeni Tahsilat
          </Button>

          {isAdmin && (
            <>
              <Button
                variant="outline-warning"
                className="touch-target d-inline-flex align-items-center justify-content-center gap-2"
                disabled={busy}
                onClick={onEdit}
              >
                <FaEdit aria-hidden="true" />
                Düzenle
              </Button>
              <Button
                variant="outline-danger"
                className="touch-target d-inline-flex align-items-center justify-content-center gap-2"
                disabled={busy}
                onClick={onDelete}
              >
                <FaTrash aria-hidden="true" />
                Sil
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
