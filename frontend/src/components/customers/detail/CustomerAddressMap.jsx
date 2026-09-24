import {
  formatCustomerField,
  getCustomerMapQuery,
  googleMapsEmbedUrl,
  googleMapsSearchUrl,
} from "@/utils/customerUtils";

export default function CustomerAddressMap({ customer }) {
  const mapQuery = getCustomerMapQuery(customer);
  const embedUrl = mapQuery ? googleMapsEmbedUrl(mapQuery) : "";
  const mapsUrl = mapQuery ? googleMapsSearchUrl(mapQuery) : "";

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="customer-detail-map mt-4">
      <iframe
        title={`${formatCustomerField(customer.companyName)} konumu`}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="customer-detail-map__open"
      >
        Google Maps’te aç
      </a>
    </div>
  );
}
