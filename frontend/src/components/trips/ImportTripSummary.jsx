import { Col } from "react-bootstrap";

import { formatDate } from "@/utils/collectionUtils";
import { formatNumber } from "@/utils/dashboardFormatters";

const SUMMARY_FIELDS = [
  { key: "totalRows", label: "Toplam Satır" },
  { key: "validRows", label: "Geçerli Satır" },
  { key: "duplicateRows", label: "Duplicate Satır" },
  { key: "invalidRows", label: "Hatalı Satır" },
];

export default function ImportTripSummary({ activeResult }) {
  return (
    <>
      <Col md={12}>
        <div className="import-summary-card border rounded p-3 bg-light">
          <div className="row g-2">
            <ImportTripMetaCell
              label="Satış Personeli"
              value={activeResult.salesmanName || "-"}
            />
            <ImportTripMetaCell
              label="Plaka"
              value={activeResult.vehiclePlate || "-"}
            />
            <ImportTripMetaCell
              label="Tarih Aralığı"
              value={`${formatDate(activeResult.startDate)} - ${formatDate(activeResult.endDate)}`}
            />
            <ImportTripMetaCell
              label="Gün Sayısı"
              value={activeResult.dayCount ?? "-"}
            />
          </div>
        </div>
      </Col>
      <Col md={12}>
        <div className="row g-2">
          {SUMMARY_FIELDS.map((field) => (
            <div key={field.key} className="col-6 col-md-3">
              <div className="import-summary-card border rounded p-3 h-100 bg-light">
                <div className="small text-muted">{field.label}</div>
                <div className="fw-bold fs-5">
                  {formatNumber(activeResult[field.key] ?? 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Col>
    </>
  );
}

function ImportTripMetaCell({ label, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="small text-muted">{label}</div>
      <div className="fw-bold">{value}</div>
    </div>
  );
}
