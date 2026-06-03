"use client";

import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import MonthlyCollectionsChart from "@/components/dashboard/MonthlyCollectionsChart";
import PaymentTypeChart from "@/components/dashboard/PaymentTypeChart";
import TopCustomersChart from "@/components/dashboard/TopCustomersChart";
import RecentCollectionsTable from "@/components/dashboard/RecentCollectionsTable";

export default function DashboardPage() {
  return (
    <div className="dashboard-page d-flex flex-column gap-4">
      <div>
        <h1 className="fw-bold mb-1">Tahsilat Analitiği</h1>
        <p className="text-muted mb-0">
          Tahsilat performansını ve dağılımını gerçek zamanlı izleyin.
        </p>
      </div>

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
