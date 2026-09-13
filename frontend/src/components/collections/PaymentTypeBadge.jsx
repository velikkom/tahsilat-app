"use client";

import { getPaymentTypeLabel, getPaymentTypeTone } from "@/utils/collectionUtils";

export default function PaymentTypeBadge({ paymentType, className = "" }) {
  const tone = getPaymentTypeTone(paymentType);

  return (
    <span
      className={`payment-type-badge payment-type-badge--${tone} ${className}`.trim()}
    >
      {getPaymentTypeLabel(paymentType)}
    </span>
  );
}
