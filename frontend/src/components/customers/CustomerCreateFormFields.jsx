import { Form } from "react-bootstrap";

export default function CustomerCreateFormFields({
  form,
  isEditMode,
  submitting,
  onChange,
}) {
  return (
    <>
      <Form.Group controlId="customer-company-name">
        <Form.Label>Şirket Adı</Form.Label>
        <Form.Control
          name="companyName"
          value={form.companyName}
          onChange={onChange}
          required
          disabled={submitting}
        />
        <Form.Control.Feedback type="invalid">
          Şirket adı zorunludur.
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="customer-authorized-person">
        <Form.Label>Yetkili Kişi</Form.Label>
        <Form.Control
          name="authorizedPerson"
          value={form.authorizedPerson}
          onChange={onChange}
          required={isEditMode}
          disabled={submitting}
        />
        {isEditMode && (
          <Form.Control.Feedback type="invalid">
            Yetkili kişi zorunludur.
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="customer-phone">
        <Form.Label>Telefon</Form.Label>
        <Form.Control
          name="phone"
          value={form.phone}
          onChange={onChange}
          required={isEditMode}
          disabled={submitting}
        />
        {isEditMode && (
          <Form.Control.Feedback type="invalid">
            Telefon zorunludur.
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="customer-tax-number">
        <Form.Label>Vergi No</Form.Label>
        <Form.Control
          name="taxNumber"
          value={form.taxNumber}
          onChange={onChange}
          disabled={submitting}
        />
      </Form.Group>
      <Form.Group controlId="customer-address">
        <Form.Label>Adres</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="address"
          value={form.address}
          onChange={onChange}
          disabled={submitting}
        />
      </Form.Group>
    </>
  );
}
