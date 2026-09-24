import { formatCurrency, formatDate } from "./formatters";
import { getPaymentTypeLabel, getStatusLabel } from "./labels";
import {
  canMarkCollectionAsPaid,
  getEffectiveStatus,
  showsMarkAsPaidAction,
} from "./maturity";
import { getMaturityDays } from "./maturityDays";
import { isCollectionInCurrentMonth } from "./summary";
import { EMPTY_COLLECTION_FILTERS } from "./filterOptions";

export function sortCollectionsByNewestDate(collections) {
  return [...collections].sort((a, b) => {
    const dateCompare = (b.collectionDate || "").localeCompare(
      a.collectionDate || ""
    );
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

function matchesQuickFilter(collection, quickFilter, effectiveStatus) {
  if (quickFilter === "THIS_MONTH") {
    return isCollectionInCurrentMonth(collection.collectionDate);
  }
  if (quickFilter === "PENDING") {
    return effectiveStatus === "PENDING";
  }
  if (quickFilter === "OVERDUE") {
    return effectiveStatus === "OVERDUE";
  }
  if (quickFilter === "DUE_MATURITY") {
    return canMarkCollectionAsPaid(collection);
  }
  if (quickFilter === "TODAY_MATURITY") {
    return getMaturityDays(collection) === 0 && showsMarkAsPaidAction(collection);
  }
  if (quickFilter === "SOON_MATURITY") {
    const days = getMaturityDays(collection);
    return days != null && days >= 1 && days <= 7;
  }
  return true;
}

function matchesSearch(collection, normalizedSearch, effectiveStatus) {
  if (!normalizedSearch) {
    return true;
  }

  const haystack = [
    collection.customerName || "",
    collection.description || "",
    collection.paymentType || "",
    getPaymentTypeLabel(collection.paymentType),
    getStatusLabel(effectiveStatus),
    String(collection.amount ?? ""),
    formatCurrency(collection.amount),
    formatDate(collection.collectionDate),
    formatDate(collection.maturityDate),
  ]
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return haystack.includes(normalizedSearch);
}

export function filterCollections(collections, filters = EMPTY_COLLECTION_FILTERS) {
  const normalizedSearch = (filters.searchQuery || "")
    .trim()
    .toLocaleLowerCase("tr-TR");

  const filtered = collections.filter((collection) => {
    const effectiveStatus = getEffectiveStatus(collection);

    if (filters.paymentType !== "ALL" && collection.paymentType !== filters.paymentType) {
      return false;
    }

    if (filters.status !== "ALL" && effectiveStatus !== filters.status) {
      return false;
    }

    return (
      matchesQuickFilter(collection, filters.quickFilter, effectiveStatus) &&
      matchesSearch(collection, normalizedSearch, effectiveStatus)
    );
  });

  return sortCollectionsByNewestDate(filtered);
}
