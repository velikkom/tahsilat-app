import { customerDisplayName } from "@/utils/customerUtils";

export default function NavbarSearchResults({
  loading,
  results,
  activeIndex,
  setActiveIndex,
  goToCustomer,
  onShowAll,
}) {
  return (
    <div className="app-navbar-search__panel" role="listbox" aria-label="Arama sonuçları">
      {loading && results.length === 0 ? (
        <div className="app-navbar-search__empty">Yükleniyor...</div>
      ) : null}

      {!loading && results.length === 0 ? (
        <div className="app-navbar-search__empty">Müşteri bulunamadı</div>
      ) : null}

      {results.map((customer, index) => (
        <button
          key={customer.id}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          className={`app-navbar-search__item${
            index === activeIndex ? " app-navbar-search__item--active" : ""
          }`}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => goToCustomer(customer)}
        >
          <span className="app-navbar-search__item-name text-truncate">
            {customerDisplayName(customer)}
          </span>
          {customer.authorizedPerson ? (
            <span className="app-navbar-search__item-meta text-truncate">
              {customer.authorizedPerson}
            </span>
          ) : null}
        </button>
      ))}

      <button type="button" className="app-navbar-search__more" onClick={onShowAll}>
        Tüm müşteriler
      </button>
    </div>
  );
}
