"use client";

import {
  formatDate,
  formatDateTime,
  formatMaturityDays,
  getPaymentTypeLabel,
} from "@/utils/collectionUtils";
import CustomerCollectionDrawerField from "./CustomerCollectionDrawerField";

export default function CustomerCollectionDrawerFields({
  collection,
  customerName,
}) {
  const maturityDays = formatMaturityDays(collection);

  return (
    <div className="customer-collection-drawer__fields">
      <CustomerCollectionDrawerField label="Müşteri">
        {collection.customerName || customerName || "-"}
      </CustomerCollectionDrawerField>

      <CustomerCollectionDrawerField label="Ödeme Türü">
        {getPaymentTypeLabel(collection.paymentType)}
      </CustomerCollectionDrawerField>

      <CustomerCollectionDrawerField label="Tahsilat Tarihi">
        {formatDate(collection.collectionDate)}
      </CustomerCollectionDrawerField>

      <CustomerCollectionDrawerField label="Vade Tarihi">
        {formatDate(collection.maturityDate)}
        {maturityDays.text !== "*" && (
          <span className={`ms-2 fw-semibold text-${maturityDays.tone}`}>
            ({maturityDays.text})
          </span>
        )}
      </CustomerCollectionDrawerField>

      <CustomerCollectionDrawerField label="Açıklama">
        {collection.description || "-"}
      </CustomerCollectionDrawerField>

      <CustomerCollectionDrawerField label="Oluşturulma Tarihi">
        {formatDateTime(collection.createdAt)}
      </CustomerCollectionDrawerField>

      <CustomerCollectionDrawerField label="Son Güncelleme">
        {formatDateTime(collection.updatedAt)}
      </CustomerCollectionDrawerField>
    </div>
  );
}
