"use client";

import CustomerTabs from "@/components/customers/detail/CustomerTabs";
import useCustomerDetail from "@/hooks/useCustomerDetail";
import { ProgressSpinner } from "primereact/progressspinner";

export default function CustomerDetailPage() {
  const { customer, loading } = useCustomerDetail();

  if (loading) {
    return (
      <div
        className="
                    d-flex
                    justify-content-center
                    align-items-center
                    vh-100
                "
      >
        <ProgressSpinner />
      </div>
    );
  }

  if (!customer) {
    return <div className="alert alert-danger">Customer not found.</div>;
  }

  return (
    <div
      className="
                d-flex
                flex-column
                gap-4
            "
    >
      <div>
        <h1 className="fw-bold">{customer.companyName}</h1>

        <p className="text-muted">Customer detail management</p>
      </div>

      <CustomerTabs customer={customer} />
    </div>
  );
}
