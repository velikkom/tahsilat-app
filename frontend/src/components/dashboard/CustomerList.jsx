import Link from "next/link";
import { formatCurrency } from "@/utils/dashboardFormatters";

export default function CustomerList({ customers }) {
  if (!customers?.length) {
    return (
      <p className="text-muted small mb-0">
        Bu firmadan geçen müşteri ödemesi yok.
      </p>
    );
  }

  return (
    <div className="payment-firm-list">
      {customers.map((customer) => {
        const href = customer.customerId
          ? `/customers/${customer.customerId}`
          : null;
        const className = "payment-firm-card text-reset text-decoration-none";

        const body = (
          <>
            <span className="payment-firm-card__copy min-width-0">
              <span className="payment-firm-card__name">{customer.companyName}</span>
              <span className="payment-firm-card__count">
                {customer.count} işlem
              </span>
            </span>
            <span className="payment-firm-card__amount">
              {formatCurrency(customer.totalAmount)}
            </span>
          </>
        );

        if (href) {
          return (
            <Link key={customer.customerId} href={href} className={className}>
              {body}
            </Link>
          );
        }

        return (
          <div key={customer.companyName} className={className}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
