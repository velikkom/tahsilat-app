import { Button, Modal, Spinner } from "react-bootstrap";

export default function CustomerCreateModalFooter({
  isEditMode,
  submitting,
  onClose,
}) {
  return (
    <Modal.Footer>
      <Button variant="outline-secondary" onClick={onClose} disabled={submitting}>
        İptal
      </Button>
      <Button variant="primary" type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner
              animation="border"
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
            Kaydediliyor...
          </>
        ) : isEditMode ? (
          "Güncelle"
        ) : (
          "Kaydet"
        )}
      </Button>
    </Modal.Footer>
  );
}
