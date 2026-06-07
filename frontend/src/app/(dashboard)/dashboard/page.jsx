"use client";

import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import DashboardInsights from "@/components/dashboard/DashboardInsights";
import DashboardYearFilter from "@/components/dashboard/DashboardYearFilter";
import MonthlyCollectionsChart from "@/components/dashboard/MonthlyCollectionsChart";
import PaymentTypeChart from "@/components/dashboard/PaymentTypeChart";
import TopCustomersChart from "@/components/dashboard/TopCustomersChart";
import RecentCollectionsTable from "@/components/dashboard/RecentCollectionsTable";
import { DashboardYearProvider } from "@/context/DashboardYearContext";

function DashboardContent() {
  return (
    <div className="dashboard-page d-flex flex-column gap-3 gap-md-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
        <div>
          <h1 className="fw-bold mb-1 page-header__title">Tahsilat Analitiği</h1>
          <p className="text-muted mb-0">
            Tahsilat performansını ve dağılımını gerçek zamanlı izleyin.
          </p>
        </div>
        <DashboardYearFilter />
      </div>

      <DashboardInsights />

      <div className="row g-3">
        <DashboardMetrics />
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-8">
          <MonthlyCollectionsChart />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <PaymentTypeChart />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <TopCustomersChart />
        </div>
        <div className="col-12 col-md-6">
          <RecentCollectionsTable />
        </div>
      </div>
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
