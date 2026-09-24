import { Button, Modal, Spinner } from "react-bootstrap";

export default function ImportTripModalFooter({
  isBusy,
  isAnalyzing,
  isImporting,
  importResult,
  canImport,
  collectionFile,
  expenseFile,
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
            disabled={!collectionFile || !expenseFile || isBusy}
          >
            {isAnalyzing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Analiz Ediliyor...
              </>
            ) : (
              "Analiz Et"
            )}
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={!canImport || isBusy}
          >
            {isImporting ? (
              <>
                <Spinner size="sm" className="me-2" />
                İçe Aktarılıyor...
              </>
            ) : (
              "İçe Aktar"
            )}
          </Button>
        </>
      )}
    </Modal.Footer>
  );
}
