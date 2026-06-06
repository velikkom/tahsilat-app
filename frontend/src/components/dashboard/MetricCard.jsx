"use client";

export default function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="metric-card card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div>
              <p className="metric-card__title text-muted mb-2">{title}</p>
              <h4 className="metric-card__value fw-bold mb-1">{value}</h4>
              {subtitle && (
                <p className="metric-card__subtitle text-muted mb-0 small">
                  {subtitle}
                </p>
              )}
            </div>

            {icon && (
              <div className="metric-card__icon rounded-circle">{icon}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
