"use client";

import { useState } from "react";

import {
  FilterMatchMode,
  FilterOperator,
} from "primereact/api";

export default function useCollectionFilters() {

  const [globalFilterValue,
    setGlobalFilterValue] =
      useState("");

  const [filters,
    setFilters] = useState(
      createDefaultFilters()
    );

  function createDefaultFilters() {

    return {

      global: {
        value: null,
        matchMode:
          FilterMatchMode.CONTAINS,
      },

      customerName: {

        operator:
          FilterOperator.AND,

        constraints: [
          {
            value: null,
            matchMode:
              FilterMatchMode.CONTAINS,
          },
        ],
      },

      paymentType: {
        value: null,
        matchMode:
          FilterMatchMode.EQUALS,
      },

      status: {
        value: null,
        matchMode:
          FilterMatchMode.EQUALS,
      },

      amount: {

        operator:
          FilterOperator.AND,

        constraints: [
          {
            value: null,
            matchMode:
              FilterMatchMode.EQUALS,
          },
        ],
      },

      collectionDate: {

        operator:
          FilterOperator.AND,

        constraints: [
          {
            value: null,
            matchMode:
              FilterMatchMode.DATE_IS,
          },
        ],
      },
    };
  }

  function clearFilter() {

    setFilters(
      createDefaultFilters()
    );

    setGlobalFilterValue("");
  }

  function onGlobalFilterChange(e) {

    const value =
      e.target.value;

    const _filters = {
      ...filters,
    };

    _filters.global.value =
      value;

    setFilters(_filters);

    setGlobalFilterValue(
      value
    );
  }

  return {

    filters,

    setFilters,

    globalFilterValue,

    clearFilter,

    onGlobalFilterChange,
  };
}