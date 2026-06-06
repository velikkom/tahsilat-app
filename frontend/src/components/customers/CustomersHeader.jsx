import React from "react";

const CustomersHeader = () => {
  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-4">
      <div>
        <h2 className="customers-page-title page-header__title mb-1">
          Customers
        </h2>
        <p className="text-muted mb-0">Customer Management</p>
      </div>
    </div>
  );
};

export default CustomersHeader;
