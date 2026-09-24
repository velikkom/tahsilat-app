import { Card, Form, Table } from "react-bootstrap";

import { formatDate } from "@/utils/collectionUtils";
import { DAILY_EXPENSE_FIELDS } from "@/utils/tripUtils";

export default function TripFormDailyExpenses({
  dailyExpenses,
  submitting,
  onDailyExpenseChange,
}) {
  return (
    <Card className="border-0 shadow-sm ui-panel-card">
      <Card.Body>
        <h5 className="fw-bold mb-3">Günlük Harcamalar</h5>
        {dailyExpenses.length === 0 ? (
          <p className="text-muted mb-0">
            Önce geçerli bir tarih aralığı seçin.
          </p>
        ) : (
          <div className="table-responsive">
            <Table
              bordered
              size="sm"
              className="trip-daily-expense-table align-middle mb-0"
            >
              <thead>
                <tr>
                  <th style={{ minWidth: 170 }}>Tarih</th>
                  {dailyExpenses.map((row) => (
                    <th
                      key={row.expenseDate}
                      className="text-center text-nowrap"
                      style={{ minWidth: 110 }}
                    >
                      {formatDate(row.expenseDate)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAILY_EXPENSE_FIELDS.map((field) => (
                  <tr key={field.key}>
                    <th className="text-nowrap">{field.label}</th>
                    {dailyExpenses.map((row) => (
                      <td key={row.expenseDate}>
                        <Form.Control
                          type={field.inputType ?? "number"}
                          min={field.inputType ? undefined : "0"}
                          step={field.inputType ? undefined : field.step}
                          value={row[field.key]}
                          onChange={(e) =>
                            onDailyExpenseChange(
                              row.expenseDate,
                              field.key,
                              e.target.value
                            )
                          }
                          disabled={submitting}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
