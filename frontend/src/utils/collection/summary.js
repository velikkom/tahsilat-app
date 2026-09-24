import { getEffectiveStatus } from "./maturity";

export function buildCollectionsSummary(collections) {
  const summary = {
    totalAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    paidAmount: 0,
    totalCount: collections.length,
    averageAmount: 0,
    maxAmount: 0,
    lastCollectionDate: null,
  };

  for (const collection of collections) {
    const amount = Number(collection.amount) || 0;
    const status = getEffectiveStatus(collection);

    summary.totalAmount += amount;

    if (status === "PENDING") {
      summary.pendingAmount += amount;
    } else if (status === "OVERDUE") {
      summary.overdueAmount += amount;
    } else if (status === "PAID") {
      summary.paidAmount += amount;
    }

    if (amount > summary.maxAmount) {
      summary.maxAmount = amount;
    }

    if (
      collection.collectionDate &&
      (!summary.lastCollectionDate ||
        collection.collectionDate > summary.lastCollectionDate)
    ) {
      summary.lastCollectionDate = collection.collectionDate;
    }
  }

  summary.averageAmount =
    summary.totalCount > 0 ? summary.totalAmount / summary.totalCount : 0;

  return summary;
}

export function isCollectionInCurrentMonth(collectionDate) {
  if (!collectionDate) {
    return false;
  }

  const date = new Date(collectionDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function buildPageCollectionStats(collections) {
  const summary = buildCollectionsSummary(collections);
  let thisMonthAmount = 0;

  for (const collection of collections) {
    if (isCollectionInCurrentMonth(collection.collectionDate)) {
      thisMonthAmount += Number(collection.amount) || 0;
    }
  }

  return {
    totalAmount: summary.totalAmount,
    thisMonthAmount,
    pendingAmount: summary.pendingAmount + summary.overdueAmount,
  };
}
