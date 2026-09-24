import { FilterMatchMode, FilterOperator } from "primereact/api";

export function createDefaultFilters() {
  return {
    global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    customerName: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
      ],
    },
    paymentType: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    status: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    amount: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
      ],
    },
    collectionDate: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.DATE_IS,
        },
      ],
    },
  };
}
