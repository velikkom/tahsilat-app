"use client";

import { useRef } from "react";
import { FaSearch } from "react-icons/fa";
import NavbarSearchResults from "./NavbarSearchResults";
import useNavbarSearch from "./useNavbarSearch";

export default function NavbarSearch() {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const search = useNavbarSearch({ rootRef, inputRef });

  return (
    <div
      ref={rootRef}
      className={`app-navbar-search${search.expanded ? " app-navbar-search--expanded" : ""}`}
    >
      <button
        type="button"
        className="app-navbar-search__toggle touch-target"
        aria-label="Ara"
        onClick={() => {
          search.setExpanded(true);
          search.setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <FaSearch aria-hidden />
      </button>

      <form className="app-navbar-search__form" onSubmit={search.handleSubmit} role="search">
        <FaSearch className="app-navbar-search__icon" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="app-navbar-search__input"
          placeholder="Ara"
          value={search.query}
          onChange={(event) => {
            search.setQuery(event.target.value);
            search.setActiveIndex(0);
            search.setOpen(true);
          }}
          onFocus={() => search.setOpen(true)}
          onKeyDown={search.handleKeyDown}
          aria-label="Müşteri ara"
          autoComplete="off"
        />
        <kbd className="app-navbar-search__kbd">Ctrl K</kbd>
      </form>

      {search.showPanel ? (
        <NavbarSearchResults
          loading={search.loading}
          results={search.results}
          activeIndex={search.activeIndex}
          setActiveIndex={search.setActiveIndex}
          goToCustomer={search.goToCustomer}
          onShowAll={() => {
            search.router.push("/customers");
            search.resetSearch();
          }}
        />
      ) : null}
    </div>
  );
}
