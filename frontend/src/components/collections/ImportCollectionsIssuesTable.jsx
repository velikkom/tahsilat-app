import { Col, Table } from "react-bootstrap";
import { formatConflictDetails } from "./formatImportConflictDetails";

export default function ImportCollectionsIssuesTable({ issues }) {
  return (
    <Col md={12}>
      <h6 className="mb-2">Detay Listesi</h6>
      <div
        className="table-responsive overflow-x-auto responsive-table-wrapper"
        style={{ "--table-min-width": "900px" }}
      >
        <div className="responsive-table-wrapper__inner">
          <Table striped bordered hover size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Satır</th>
                <th>Müşteri</th>
                <th>Tip</th>
                <th>Normalize Ad</th>
                <th>Eşleşen Müşteri</th>
                <th>Mesaj</th>
                <th>Çakışma Detayı</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr
                  key={`${issue.rowNumber}-${issue.issueType}-${issue.message}-${issue.conflictRowNumber || ""}`}
                >
                  <td>{issue.rowNumber}</td>
                  <td>{issue.customerName || "-"}</td>
                  <td>{issue.issueType}</td>
                  <td>{issue.normalizedCustomerName || "-"}</td>
                  <td>
                    {issue.matchedCustomerName
                      ? `${issue.matchedCustomerName}${issue.matchedCustomerId ? ` (${issue.matchedCustomerId})` : ""}`
                      : "-"}
                  </td>
                  <td>{issue.message}</td>
                  <td className="small">{formatConflictDetails(issue)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </Col>
  );
}
