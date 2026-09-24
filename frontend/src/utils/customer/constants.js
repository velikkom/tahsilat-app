export const CUSTOMER_PAGE_SIZE = 10;

export const CUSTOMER_ACTIVE_FILTER = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const CUSTOMER_QUICK_FILTER = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  THIS_MONTH: "THIS_MONTH",
};

export const CUSTOMER_QUICK_FILTER_OPTIONS = [
  { value: CUSTOMER_QUICK_FILTER.ALL, label: "Tümü" },
  { value: CUSTOMER_QUICK_FILTER.ACTIVE, label: "Aktif" },
  { value: CUSTOMER_QUICK_FILTER.INACTIVE, label: "Pasif" },
  { value: CUSTOMER_QUICK_FILTER.THIS_MONTH, label: "Bu Ay Eklenen" },
];

export const EMPTY_CUSTOMER_FILTERS = {
  companyName: "",
  authorizedPerson: "",
  phone: "",
  active: CUSTOMER_ACTIVE_FILTER.ALL,
};
