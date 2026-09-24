import {
  dryRunTripImport,
  importTripFromExcel,
} from "@/services/tripImportService";

export async function runTripImportDryRun({
  collectionFile,
  expenseFile,
  actionLockRef,
  isBusy,
  setIsAnalyzing,
  setError,
  setImportResult,
  setConfirmOverlap,
  setDryRunResult,
}) {
  if (!collectionFile || !expenseFile || actionLockRef.current || isBusy) {
    return;
  }

  actionLockRef.current = true;
  setIsAnalyzing(true);
  setError(null);
  setImportResult(null);
  setConfirmOverlap(false);

  try {
    const result = await dryRunTripImport(collectionFile, expenseFile);
    setDryRunResult(result);
  } catch (err) {
    setError(err.message || "Dosyalar analiz edilirken hata oluştu.");
    setDryRunResult(null);
  } finally {
    actionLockRef.current = false;
    setIsAnalyzing(false);
  }
}

export async function runTripImport({
  collectionFile,
  expenseFile,
  dryRunResult,
  confirmOverlap,
  actionLockRef,
  isBusy,
  setIsImporting,
  setError,
  setImportResult,
  onImported,
}) {
  if (
    !collectionFile ||
    !expenseFile ||
    !dryRunResult ||
    dryRunResult.validRows <= 0 ||
    (dryRunResult.hasOverlap && !confirmOverlap) ||
    actionLockRef.current ||
    isBusy
  ) {
    return;
  }

  actionLockRef.current = true;
  setIsImporting(true);
  setError(null);

  try {
    const result = await importTripFromExcel(collectionFile, expenseFile, confirmOverlap);
    setImportResult(result);
    await onImported?.(result);
  } catch (err) {
    setError(err.message || "İçe aktarma sırasında hata oluştu.");
  } finally {
    actionLockRef.current = false;
    setIsImporting(false);
  }
}
