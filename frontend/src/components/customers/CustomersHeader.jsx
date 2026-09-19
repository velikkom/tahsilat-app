import React from "react";

const CustomersHeader = () => {
  return (
    <div className="customers-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
      <div>
        <h2 className="customers-page-title page-header__title mb-1">
          Müşteriler
        </h2>
        <p className="text-muted mb-0">Müşteri yönetimi</p>
      </div>
    </div>
  );
};

export default CustomersHeader;
