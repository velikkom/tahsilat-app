"use client";

import { useMemo } from "react";
import { MonthlyCollectionsChartView } from "@/components/dashboard/MonthlyCollectionsChart";
import { buildCustomerMonthlyCollections } from "@/components/dashboard/monthlyCollectionsChartConfig";
import useBreakpoint from "@/hooks/useBreakpoint";

export default function CustomerMonthlyCollectionsChart({ collections }) {
  const { isMobile } = useBreakpoint();
  const year = new Date().getFullYear();
  const data = useMemo(
    () => buildCustomerMonthlyCollections(collections, year),
    [collections, year]
  );

  return (
    <MonthlyCollectionsChartView
      data={data}
      title={`Aylık ödemeler (${year})`}
      hint="Üzerine gelince bu aydaki ödeme dağılımı açılır."
      isMobile={isMobile}
      year={year}
      chartYear={year}
    />
  );
}
