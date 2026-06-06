export default function DashboardCard({ title, value }) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <h6 className="text-muted">{title}</h6>
          <h3 className="mb-0">{value}</h3>
        </div>
      </div>
    </div>
  );
}
