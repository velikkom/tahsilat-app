import Link from "next/link";
import { Spinner } from "react-bootstrap";
import CustomerDetailHeader from "@/components/customers/detail/CustomerDetailHeader";
import CustomerTabs from "@/components/customers/detail/CustomerTabs";

export default function CustomerDetailPageBody({
  loading,
  customer,
  isAdmin,
  busy,
  dataKey,
  onNewCollection,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-detail-page d-flex flex-column gap-3">
        <Link
          href="/customers"
          className="btn btn-outline-secondary touch-target align-self-start"
        >
          Geri
        </Link>
        <div className="alert alert-danger mb-0">Müşteri bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="customer-detail-page d-flex flex-column gap-3 gap-md-4">
      <CustomerDetailHeader
        customer={customer}
        isAdmin={isAdmin}
        busy={busy}
        onNewCollection={onNewCollection}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <CustomerTabs key={`${customer.id}-${dataKey}`} customer={customer} />
    </div>
  );
}
