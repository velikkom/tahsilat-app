import CustomerSummaryCards from "./CustomerSummaryCards";

import CustomerInfoCard from "./CustomerInfoCard";

export default function CustomerOverview({ customer }) {
  return (
    <div
      className="
                d-flex
                flex-column
                gap-4
            "
    >
      <CustomerSummaryCards customer={customer} />

      <CustomerInfoCard customer={customer} />
    </div>
  );
}
