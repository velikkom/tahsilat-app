"use client";

import DashboardSummary from "@/components/dashboard/DashboardSummary";
import DashboardCustomers from "@/components/dashboard/DashboardCustomers";
import DashboardAging from "@/components/dashboard/DashboardAging";
import DashboardYearFilter from "@/components/dashboard/DashboardYearFilter";
import MonthlyCollectionsChart from "@/components/dashboard/MonthlyCollectionsChart";
import DashboardMonthDetail from "@/components/dashboard/DashboardMonthDetail";
import DueMaturityBanner from "@/components/collections/DueMaturityBanner";
import ERPDashboardSummary from "@/components/ERPDashboardSummary";
import useDashboardYear, {
  DashboardYearProvider,
} from "@/context/DashboardYearContext";

function DashboardContent() {
  const { month } = useDashboardYear();
  return (
    <div className="dashboard-page d-flex flex-column gap-3 gap-md-4">
      <div>
        <h1 className="fw-bold mb-1 page-header__title">Ana Sayfa</h1>
        <p className="text-muted mb-0">
          Ödenen, bekleyen ve vadesi gelen tahsilatların özeti.
        </p>
      </div>

      <DueMaturityBanner />

      <ERPDashboardSummary />

      <DashboardSummary />

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
        <h2 className="h5 fw-bold mb-0">Kırılımlar</h2>
        <DashboardYearFilter />
      </div>

      <MonthlyCollectionsChart />

      <DashboardMonthDetail />

      {month == null && <DashboardCustomers />}

      <DashboardAging />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardYearProvider>
      <DashboardContent />
    </DashboardYearProvider>
  );
}
