"use client";

import ThemeToggle from "@/components/layout/ThemeToggle";
import useTheme from "@/context/ThemeContext";

const ROWS = [
  {
    firm: "Atak Taşıt",
    type: "Mailorder",
    amount: "₺184.500",
    status: "Ödendi",
    tone: "success",
  },
  {
    firm: "Marmara Lojistik",
    type: "Senet",
    amount: "₺92.000",
    status: "Bekliyor",
    tone: "warning",
  },
  {
    firm: "Ege Ticaret",
    type: "Havale",
    amount: "₺41.250",
    status: "Gecikmiş",
    tone: "danger",
  },
];

export default function ERPDashboardSummary() {
  const { isDark } = useTheme();

  return (
    <section className="erp-dashboard-summary" data-erp-palette="true">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h2 className="h5 fw-bold mb-1 page-header__title">
            ERP palet önizleme
          </h2>
          <p className="text-muted mb-0">
            Kart, tablo, CTA ve AI renklerini {isDark ? "koyu" : "açık"} temada
            kontrol edin.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-primary">
            {isDark ? "data-bs-theme=dark" : "data-bs-theme=light"}
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ui-stat-card ui-stat-card--primary card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="ui-stat-card__label text-muted">Toplam tahsilat</div>
              <div className="ui-stat-card__value fw-bold mt-1">₺317.750</div>
              <div className="text-muted small mt-1">Bu ay</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ui-stat-card ui-stat-card--success card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="ui-stat-card__label text-muted">Ödendi</div>
              <div className="ui-stat-card__value fw-bold mt-1">₺184.500</div>
              <div className="text-muted small mt-1">Kasaya giren</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ui-stat-card ui-stat-card--warning card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="ui-stat-card__label text-muted">Bekleyen</div>
              <div className="ui-stat-card__value fw-bold mt-1">₺92.000</div>
              <div className="text-muted small mt-1">Çek / senet</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ui-stat-card ui-stat-card--danger card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="ui-stat-card__label text-muted">Gecikmiş</div>
              <div className="ui-stat-card__value fw-bold mt-1">₺41.250</div>
              <div className="text-muted small mt-1">Aksiyon gerekli</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <h3 className="h6 fw-bold mb-0">Son tahsilatlar</h3>
                <button type="button" className="btn btn-primary btn-sm">
                  Yeni tahsilat
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Firma</th>
                      <th scope="col">Tür</th>
                      <th scope="col">Tutar</th>
                      <th scope="col">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.firm}>
                        <td className="fw-semibold">{row.firm}</td>
                        <td className="text-muted">{row.type}</td>
                        <td>{row.amount}</td>
                        <td>
                          <span className={`badge text-bg-${row.tone}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100 erp-ai-card">
            <div className="card-body d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="erp-ai-card__mark" aria-hidden>
                  AI
                </span>
                <div>
                  <h3 className="h6 fw-bold mb-0">AI analitik</h3>
                  <p className="text-muted small mb-0">Nakit akışı tahmini</p>
                </div>
                <span className="badge badge-ai ms-auto">--erp-ai</span>
              </div>
              <p className="mb-3">
                Eylül tahsilatlarının %58’i mailorder. Gecikmiş senetler bu hafta
                nakit açığı yaratabilir.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge text-bg-success">Success</span>
                <span className="badge text-bg-warning">Warning</span>
                <span className="badge text-bg-danger">Danger</span>
              </div>
              <button type="button" className="btn btn-ai mt-auto">
                Analizi aç
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
