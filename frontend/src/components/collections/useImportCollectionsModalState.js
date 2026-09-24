import { useRef, useState } from "react";

export default function useImportCollectionsModalState() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const actionLockRef = useRef(false);

  const resetState = () => {
    setSelectedFile(null);
    setDryRunResult(null);
    setImportResult(null);
    setIsAnalyzing(false);
    setIsImporting(false);
    setError(null);
    actionLockRef.current = false;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setDryRunResult(null);
    setImportResult(null);
    setError(null);
  };

  return {
    selectedFile,
    dryRunResult,
    importResult,
    isAnalyzing,
    isImporting,
    error,
    isBusy: isAnalyzing || isImporting,
    actionLockRef,
    setIsAnalyzing,
    setIsImporting,
    setError,
    setImportResult,
    setDryRunResult,
    resetState,
    handleFileChange,
  };
}
