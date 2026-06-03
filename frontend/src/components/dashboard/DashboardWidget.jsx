"use client";

import { ProgressSpinner } from "primereact/progressspinner";

export default function DashboardWidget({
  title,
  loading,
  error,
  onRetry,
  children,
  className = "",
}) {
  return (
    <div className={`dashboard-widget card border-0 shadow-sm h-100 ${className}`}>
      <div className="card-body d-flex flex-column">
        {title && <h5 className="card-title mb-3">{title}</h5>}

        {loading && (
          <div className="dashboard-widget__state flex-grow-1">
            <ProgressSpinner style={{ width: "40px", height: "40px" }} />
            <span className="text-muted mt-2">Yükleniyor...</span>
          </div>
        )}

        {!loading && error && (
          <div className="dashboard-widget__state flex-grow-1">
            <div className="alert alert-danger mb-0 w-100" role="alert">
              {error}
            </div>
            {onRetry && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-3"
                onClick={onRetry}
              >
                Tekrar Dene
              </button>
            )}
          </div>
        )}

        {!loading && !error && children}
      </div>
    </div>
  );
}
