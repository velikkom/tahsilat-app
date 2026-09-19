"use client";

import Link from "next/link";
import useDueMaturitySummary from "@/context/DueMaturityContext";
import { formatCurrency } from "@/utils/collectionUtils";

export default function DueMaturityBanner() {
  const { count, amount, loading } = useDueMaturitySummary();

  if (loading || count === 0) {
    return null;
  }

  return (
    <Link
      href="/collections?due=1"
      className="due-maturity-banner text-decoration-none"
    >
      <i className="pi pi-exclamation-triangle" aria-hidden="true" />
      <span>
        <strong>
          {count} vadesi gelen çek/senet
        </strong>
        {" · "}
        {formatCurrency(amount)}
      </span>
      <span className="due-maturity-banner__action">Listeye git</span>
    </Link>
  );
}
