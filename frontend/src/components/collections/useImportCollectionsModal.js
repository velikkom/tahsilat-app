import {
  runCollectionImport,
  runCollectionImportDryRun,
} from "./importCollectionsModalActions";
import useImportCollectionsModalState from "./useImportCollectionsModalState";

export default function useImportCollectionsModal({ onClose, onImported }) {
  const state = useImportCollectionsModalState();

  function handleClose() {
    if (state.isAnalyzing || state.isImporting) {
      return;
    }

    state.resetState();
    onClose();
  }

  return {
    selectedFile: state.selectedFile,
    dryRunResult: state.dryRunResult,
    importResult: state.importResult,
    isAnalyzing: state.isAnalyzing,
    isImporting: state.isImporting,
    error: state.error,
    isBusy: state.isBusy,
    handleClose,
    handleFileChange: state.handleFileChange,
    handleDryRun: () =>
      runCollectionImportDryRun({
        selectedFile: state.selectedFile,
        actionLockRef: state.actionLockRef,
        isAnalyzing: state.isAnalyzing,
        isImporting: state.isImporting,
        setIsAnalyzing: state.setIsAnalyzing,
        setError: state.setError,
        setImportResult: state.setImportResult,
        setDryRunResult: state.setDryRunResult,
      }),
    handleImport: () =>
      runCollectionImport({
        selectedFile: state.selectedFile,
        dryRunResult: state.dryRunResult,
        actionLockRef: state.actionLockRef,
        isAnalyzing: state.isAnalyzing,
        isImporting: state.isImporting,
        setIsImporting: state.setIsImporting,
        setError: state.setError,
        setImportResult: state.setImportResult,
        onImported,
      }),
  };
}
