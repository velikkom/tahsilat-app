"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import useCustomers from "@/hooks/useCustomers";
import {
  customerDisplayName,
  filterCustomersByQuery,
} from "@/utils/customerUtils";

const RESULT_LIMIT = 8;

export default function NavbarSearch() {
  const router = useRouter();
  const { customers, loading } = useCustomers();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return filterCustomersByQuery(customers, query).slice(0, RESULT_LIMIT);
  }, [customers, query]);

  const showPanel = open && query.trim().length > 0;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setExpanded(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    function handleShortcut(event) {
      const isK = event.key === "k" || event.key === "K";
      const modifier = event.metaKey || event.ctrlKey;

      if (!modifier || !isK) {
        return;
      }

      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) {
        return;
      }

      event.preventDefault();
      setExpanded(true);
      setOpen(true);
      inputRef.current?.focus();
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function goToCustomer(customer) {
    if (!customer?.id) {
      return;
    }

    router.push(`/customers/${customer.id}`);
    setQuery("");
    setOpen(false);
    setExpanded(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (results[activeIndex]) {
      goToCustomer(results[activeIndex]);
      return;
    }

    router.push("/customers");
    setQuery("");
    setOpen(false);
    setExpanded(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      setExpanded(false);
      inputRef.current?.blur();
      return;
    }

    if (!showPanel) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
  }

  return (
    <div
      ref={rootRef}
      className={`app-navbar-search${expanded ? " app-navbar-search--expanded" : ""}`}
    >
      <button
        type="button"
        className="app-navbar-search__toggle touch-target"
        aria-label="Ara"
        onClick={() => {
          setExpanded(true);
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <FaSearch aria-hidden />
      </button>

      <form className="app-navbar-search__form" onSubmit={handleSubmit} role="search">
        <FaSearch className="app-navbar-search__icon" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="app-navbar-search__input"
          placeholder="Ara"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Müşteri ara"
          autoComplete="off"
        />
        <kbd className="app-navbar-search__kbd">Ctrl K</kbd>
      </form>

      {showPanel ? (
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

          <button
            type="button"
            className="app-navbar-search__more"
            onClick={() => {
              router.push("/customers");
              setQuery("");
              setOpen(false);
              setExpanded(false);
            }}
          >
            Tüm müşteriler
          </button>
        </div>
      ) : null}
    </div>
  );
}
