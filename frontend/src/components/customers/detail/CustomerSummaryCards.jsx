export default function CustomerSummaryCards({ customer }) {
  const cards = [
    { title: "Total Collections", value: "₺0" },
    { title: "Pending Amount", value: "₺0" },
    { title: "Paid Amount", value: "₺0" },
    { title: "Risk Level", value: "LOW" },
  ];

  return (
    <div className="row g-3 g-md-4">
      {cards.map((card) => (
        <div key={card.title} className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted mb-2 small">{card.title}</div>
              <h3 className="fw-bold mb-0 fs-4">{card.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
