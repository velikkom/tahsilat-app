import { Col, Table } from "react-bootstrap";

export default function ImportTripIssuesTable({ issues }) {
  return (
    <Col md={12}>
      <h6 className="mb-2">Detay Listesi</h6>
      <div
        className="table-responsive overflow-x-auto responsive-table-wrapper"
        style={{ "--table-min-width": "700px" }}
      >
        <div className="responsive-table-wrapper__inner">
          <Table striped bordered hover size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Satır</th>
                <th>Müşteri</th>
                <th>Tip</th>
                <th>Mesaj</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={`${issue.rowNumber || "0"}-${issue.issueType}-${index}`}>
                  <td>{issue.rowNumber ?? "-"}</td>
                  <td>{issue.customerName || "-"}</td>
                  <td>{issue.issueType}</td>
                  <td>{issue.message}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </Col>
  );
}
