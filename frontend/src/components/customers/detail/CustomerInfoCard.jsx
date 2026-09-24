"use client";

import CustomerPhoneActions from "@/components/customers/CustomerPhoneActions";
import CustomerAddressMap from "@/components/customers/detail/CustomerAddressMap";
import {
  formatCustomerDate,
  formatCustomerField,
  getCustomerMapQuery,
  googleMapsSearchUrl,
} from "@/utils/customerUtils";

function InfoField({ label, children }) {
  return (
    <div className="col-12 col-md-6">
      <span className="customer-detail-field__label">{label}</span>
      <div className="customer-detail-field__value">{children}</div>
    </div>
  );
}

export default function CustomerInfoCard({ customer }) {
  const mapQuery = getCustomerMapQuery(customer);
  const mapsUrl = mapQuery ? googleMapsSearchUrl(mapQuery) : "";

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold mb-4">Müşteri Bilgileri</h5>
        <div className="row g-3 g-md-4">
          <InfoField label="Şirket Adı">
            {formatCustomerField(customer.companyName)}
          </InfoField>
          <InfoField label="Yetkili Kişi">
            {formatCustomerField(customer.authorizedPerson)}
          </InfoField>
          <InfoField label="Telefon">
            {customer.phone ? (
              <CustomerPhoneActions phone={customer.phone} />
            ) : (
              "-"
            )}
          </InfoField>
          <InfoField label="Vergi No">
            {formatCustomerField(customer.taxNumber)}
          </InfoField>
          <InfoField label="Adres">
            {mapQuery ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="customer-detail-map__link"
              >
                {mapQuery}
              </a>
            ) : (
              "-"
            )}
          </InfoField>
          <InfoField label="Kayıt Tarihi">
            {formatCustomerDate(customer.createdAt)}
          </InfoField>
        </div>
        <CustomerAddressMap customer={customer} />
      </div>
    </div>
  );
}
