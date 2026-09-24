import { formatMonthYear } from "./formatters";

export function groupCollectionsByMonth(collections) {
  const groups = new Map();

  const sorted = [...collections].sort((a, b) =>
    (b.collectionDate || "").localeCompare(a.collectionDate || "")
  );

  for (const collection of sorted) {
    const key = collection.collectionDate
      ? collection.collectionDate.slice(0, 7)
      : "unknown";

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatMonthYear(collection.collectionDate),
        items: [],
      });
    }

    groups.get(key).items.push(collection);
  }

  return Array.from(groups.values());
}
