import { Form, Col } from "react-bootstrap";
import MailOrderCompanyField from "@/components/forms/MailOrderCompanyField";

export default function CollectionMetaFields({
  form,
  isFormDisabled,
  onChange,
  mailOrderCompanies,
}) {
  return (
    <>
      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Tahsilat Makbuz No</Form.Label>
          <Form.Control
            type="text"
            name="receiptNumber"
            value={form.receiptNumber}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>
      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Mikro Kay.No SR</Form.Label>
          <Form.Control
            type="text"
            name="mikroSr"
            value={form.mikroSr}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>
      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Mikro Kay.No NO</Form.Label>
          <Form.Control
            type="text"
            name="mikroNo"
            value={form.mikroNo}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>
      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Banka Adı</Form.Label>
          <Form.Control
            type="text"
            name="bankName"
            value={form.bankName}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>
      {form.paymentType === "MAIL_ORDER" && (
        <Col xs={12} md={6} lg={3}>
          <MailOrderCompanyField
            value={form.mailOrderCompany}
            companies={mailOrderCompanies}
            disabled={isFormDisabled}
            onChange={(nextValue) =>
              onChange({
                target: { name: "mailOrderCompany", value: nextValue },
              })
            }
          />
        </Col>
      )}
    </>
  );
}
