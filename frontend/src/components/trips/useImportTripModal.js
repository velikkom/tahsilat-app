import {
  runTripImport,
  runTripImportDryRun,
} from "@/components/trips/importTripModalActions";
import useImportTripModalState from "@/components/trips/useImportTripModalState";

export default function useImportTripModal({ onClose, onImported }) {
  const state = useImportTripModalState();

  function handleClose() {
    if (state.isBusy) {
      return;
    }

    state.resetState();
    onClose();
  }

  return {
    collectionFile: state.collectionFile,
    expenseFile: state.expenseFile,
    dryRunResult: state.dryRunResult,
    importResult: state.importResult,
    confirmOverlap: state.confirmOverlap,
    isAnalyzing: state.isAnalyzing,
    isImporting: state.isImporting,
    error: state.error,
    isBusy: state.isBusy,
    handleClose,
    setConfirmOverlap: state.setConfirmOverlap,
    handleCollectionFileChange: state.handleCollectionFileChange,
    handleExpenseFileChange: state.handleExpenseFileChange,
    handleDryRun: () =>
      runTripImportDryRun({
        collectionFile: state.collectionFile,
        expenseFile: state.expenseFile,
        actionLockRef: state.actionLockRef,
        isBusy: state.isBusy,
        setIsAnalyzing: state.setIsAnalyzing,
        setError: state.setError,
        setImportResult: state.setImportResult,
        setConfirmOverlap: state.setConfirmOverlap,
        setDryRunResult: state.setDryRunResult,
      }),
    handleImport: () =>
      runTripImport({
        collectionFile: state.collectionFile,
        expenseFile: state.expenseFile,
        dryRunResult: state.dryRunResult,
        confirmOverlap: state.confirmOverlap,
        actionLockRef: state.actionLockRef,
        isBusy: state.isBusy,
        setIsImporting: state.setIsImporting,
        setError: state.setError,
        setImportResult: state.setImportResult,
        onImported,
      }),
  };
}
