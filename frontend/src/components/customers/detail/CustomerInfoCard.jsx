export default function CustomerInfoCard({ customer }) {
  return (
    <div
      className="
                card
                border-0
                shadow-sm
            "
    >
      <div className="card-body">
        <h5
          className="
                        fw-bold
                        mb-4
                    "
        >
          Company Information
        </h5>

        <div className="row g-4">
          <div className="col-md-4">
            <strong>Company Name</strong>

            <div>{customer.companyName}</div>
          </div>

          <div className="col-md-4">
            <strong>Tax Number</strong>

            <div>{customer.taxNumber}</div>
          </div>

          <div className="col-md-4">
            <strong>Phone</strong>

            <div>{customer.phone || "-"}</div>
          </div>

          <div className="col-md-4">
            <strong>Authorized Person</strong>

            <div>{customer.authorizedPerson || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
