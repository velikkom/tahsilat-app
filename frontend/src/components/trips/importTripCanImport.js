export default function importTripCanImport({
  collectionFile,
  expenseFile,
  dryRunResult,
  confirmOverlap,
}) {
  return Boolean(
    collectionFile &&
      expenseFile &&
      dryRunResult &&
      dryRunResult.validRows > 0 &&
      (!dryRunResult.hasOverlap || confirmOverlap)
  );
}
