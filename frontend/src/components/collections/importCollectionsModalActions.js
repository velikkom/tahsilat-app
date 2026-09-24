import {
  dryRunCollectionImport,
  importCollectionsFromExcel,
} from "@/services/collectionImportService";

export async function runCollectionImportDryRun({
  selectedFile,
  actionLockRef,
  isAnalyzing,
  isImporting,
  setIsAnalyzing,
  setError,
  setImportResult,
  setDryRunResult,
}) {
  if (!selectedFile || actionLockRef.current || isAnalyzing || isImporting) {
    return;
  }

  actionLockRef.current = true;
  setIsAnalyzing(true);
  setError(null);
  setImportResult(null);

  try {
    const result = await dryRunCollectionImport(selectedFile);
    setDryRunResult(result);
  } catch (err) {
    setError(err.message || "Dosya analiz edilirken hata oluştu.");
    setDryRunResult(null);
  } finally {
    actionLockRef.current = false;
    setIsAnalyzing(false);
  }
}

export async function runCollectionImport({
  selectedFile,
  dryRunResult,
  actionLockRef,
  isAnalyzing,
  isImporting,
  setIsImporting,
  setError,
  setImportResult,
  onImported,
}) {
  if (
    !selectedFile ||
    !dryRunResult ||
    dryRunResult.validRows <= 0 ||
    actionLockRef.current ||
    isAnalyzing ||
    isImporting
  ) {
    return;
  }

  actionLockRef.current = true;
  setIsImporting(true);
  setError(null);

  try {
    const result = await importCollectionsFromExcel(selectedFile);
    setImportResult(result);
    await onImported?.(result);
  } catch (err) {
    setError(err.message || "Import sırasında hata oluştu.");
  } finally {
    actionLockRef.current = false;
    setIsImporting(false);
  }
}
