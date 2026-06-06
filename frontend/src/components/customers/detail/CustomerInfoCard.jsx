export default function CustomerInfoCard({ customer }) {
  const fields = [
    { label: "Company Name", value: customer.companyName },
    { label: "Tax Number", value: customer.taxNumber },
    { label: "Phone", value: customer.phone || "-" },
    { label: "Authorized Person", value: customer.authorizedPerson || "-" },
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold mb-4">Company Information</h5>

        <div className="row g-3 g-md-4">
          {fields.map((field) => (
            <div key={field.label} className="col-12 col-md-6 col-lg-4">
              <strong className="d-block mb-1">{field.label}</strong>
              <div className="text-break">{field.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
