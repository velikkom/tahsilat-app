import { customerDisplayName } from "@/utils/customerUtils";

export default function CustomerSelectSuggestions({
  loading,
  value,
  suggestions,
  onSelect,
}) {
  return (
    <ul
      id="customer-select-options"
      className="customer-select-field__list"
      role="listbox"
    >
      {suggestions.length === 0 ? (
        <li className="customer-select-field__empty">
          {loading ? "Müşteriler yükleniyor..." : "Eşleşen müşteri yok"}
        </li>
      ) : (
        suggestions.map((customer) => (
          <li key={customer.id}>
            <button
              type="button"
              className="customer-select-field__option"
              role="option"
              aria-selected={customer.id === value}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => onSelect(customer)}
            >
              <span className="customer-select-field__name">
                {customerDisplayName(customer)}
              </span>
              {customer.authorizedPerson &&
                customer.authorizedPerson !== customerDisplayName(customer) && (
                  <span className="customer-select-field__meta">
                    {customer.authorizedPerson}
                  </span>
                )}
            </button>
          </li>
        ))
      )}
    </ul>
  );
}
