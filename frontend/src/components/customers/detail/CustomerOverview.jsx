"use client";

import { useMemo } from "react";
import { Spinner } from "react-bootstrap";

import CustomerInfoCard from "./CustomerInfoCard";
import CustomerCollectionsSummary from "./collections/CustomerCollectionsSummary";
import useCustomerCollections from "@/hooks/useCustomerCollections";
import { buildCollectionsSummary } from "@/utils/collectionUtils";

export default function CustomerOverview({ customer }) {
  const { collections, loading } = useCustomerCollections(customer.id);
  const summary = useMemo(
    () => buildCollectionsSummary(collections),
    [collections]
  );

  return (
    <div className="d-flex flex-column gap-4">
      {loading ? (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <CustomerCollectionsSummary summary={summary} />
      )}

      <CustomerInfoCard customer={customer} />
    </div>
  );
}
