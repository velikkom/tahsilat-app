import { Col } from "react-bootstrap";
import { formatNumber } from "@/utils/dashboardFormatters";

const SUMMARY_FIELDS = [
  { key: "totalRows", label: "Toplam Satır" },
  { key: "validRows", label: "Geçerli Satır" },
  { key: "duplicateRows", label: "Duplicate Satır" },
  { key: "invalidRows", label: "Hatalı Satır" },
];

export default function ImportCollectionsSummary({ activeResult }) {
  return (
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
  );
}
