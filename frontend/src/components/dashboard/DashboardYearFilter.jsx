"use client";

import { Button, ButtonGroup, Form } from "react-bootstrap";
import useDashboardYear, {
  DASHBOARD_MONTH_OPTIONS,
  DASHBOARD_YEAR_OPTIONS,
} from "@/context/DashboardYearContext";

export default function DashboardYearFilter() {
  const { year, setYear, month, setMonth, chartYear } = useDashboardYear();

  return (
    <div className="d-flex flex-column align-items-stretch align-items-sm-end gap-2">
      <ButtonGroup aria-label="Yıl filtresi">
        {DASHBOARD_YEAR_OPTIONS.map((option) => (
          <Button
            key={option.label}
            variant={year === option.value ? "primary" : "outline-primary"}
            size="sm"
            className="touch-target"
            onClick={() => setYear(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>

      <Form.Select
        size="sm"
        aria-label="Ay filtresi"
        value={month ?? ""}
        onChange={(event) => {
          const nextValue = event.target.value;
          const nextMonth = nextValue === "" ? null : Number(nextValue);

          if (nextMonth != null && year == null) {
            setYear(chartYear);
          }

          setMonth(nextMonth);
        }}
        className="dashboard-month-select"
      >
        {DASHBOARD_MONTH_OPTIONS.map((option) => (
          <option key={option.label} value={option.value ?? ""}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </div>
  );
}
