import { useRef, useState } from "react";

export default function useImportTripModalState() {
  const [collectionFile, setCollectionFile] = useState(null);
  const [expenseFile, setExpenseFile] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [confirmOverlap, setConfirmOverlap] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const actionLockRef = useRef(false);

  function resetState() {
    setCollectionFile(null);
    setExpenseFile(null);
    setDryRunResult(null);
    setImportResult(null);
    setConfirmOverlap(false);
    setIsAnalyzing(false);
    setIsImporting(false);
    setError(null);
    actionLockRef.current = false;
  }

  function clearResults() {
    setDryRunResult(null);
    setImportResult(null);
    setError(null);
  }

  return {
    collectionFile,
    expenseFile,
    dryRunResult,
    importResult,
    confirmOverlap,
    isAnalyzing,
    isImporting,
    error,
    isBusy: isAnalyzing || isImporting,
    actionLockRef,
    setConfirmOverlap,
    setIsAnalyzing,
    setIsImporting,
    setError,
    setImportResult,
    setDryRunResult,
    resetState,
    handleCollectionFileChange: (event) => {
      setCollectionFile(event.target.files?.[0] || null);
      clearResults();
    },
    handleExpenseFileChange: (event) => {
      setExpenseFile(event.target.files?.[0] || null);
      clearResults();
    },
  };
}
