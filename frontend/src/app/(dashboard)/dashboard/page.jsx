"use client";

import DashboardSummary from "@/components/dashboard/DashboardSummary";
import DashboardCustomers from "@/components/dashboard/DashboardCustomers";
import DashboardPaymentTypes from "@/components/dashboard/DashboardPaymentTypes";
import DashboardAging from "@/components/dashboard/DashboardAging";
import DashboardYearFilter from "@/components/dashboard/DashboardYearFilter";
import MonthlyCollectionsChart from "@/components/dashboard/MonthlyCollectionsChart";
import DueMaturityBanner from "@/components/collections/DueMaturityBanner";
import { DashboardYearProvider } from "@/context/DashboardYearContext";

function DashboardContent() {
  return (
    <div className="dashboard-page d-flex flex-column gap-3 gap-md-4">
      <div>
        <h1 className="fw-bold mb-1 page-header__title">Ana Sayfa</h1>
        <p className="text-muted mb-0">
          Ödenen, bekleyen ve vadesi gelen tahsilatların özeti.
        </p>
      </div>

      <DueMaturityBanner />

      <DashboardSummary />

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
        <h2 className="h5 fw-bold mb-0">Kırılımlar</h2>
        <DashboardYearFilter />
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <DashboardCustomers />
        </div>
        <div className="col-12 col-lg-6">
          <DashboardPaymentTypes />
        </div>
      </div>

      <MonthlyCollectionsChart />

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
