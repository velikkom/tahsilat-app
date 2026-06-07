"use client";

import { Button, ButtonGroup } from "react-bootstrap";
import useDashboardYear, {
  DASHBOARD_YEAR_OPTIONS,
} from "@/context/DashboardYearContext";

export default function DashboardYearFilter() {
  const { year, setYear } = useDashboardYear();

  return (
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
  );
}
