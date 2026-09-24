import { Button, Modal, Spinner } from "react-bootstrap";

export default function ImportCollectionsModalFooter({
  isBusy,
  isAnalyzing,
  isImporting,
  selectedFile,
  dryRunResult,
  importResult,
  handleClose,
  handleDryRun,
  handleImport,
}) {
  return (
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose} disabled={isBusy}>
        Kapat
      </Button>
      {!importResult && (
        <>
          <Button
            variant="outline-primary"
            onClick={handleDryRun}
            disabled={!selectedFile || isBusy}
          >
            {isAnalyzing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Analiz Ediliyor...
              </>
            ) : (
              "Analiz Et (Dry Run)"
            )}
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={
              !selectedFile ||
              !dryRunResult ||
              dryRunResult.validRows <= 0 ||
              isBusy
            }
          >
            {isImporting ? (
              <>
                <Spinner size="sm" className="me-2" />
                İçe Aktarılıyor...
              </>
            ) : (
              "Import Et"
            )}
          </Button>
        </>
      )}
    </Modal.Footer>
  );
}
