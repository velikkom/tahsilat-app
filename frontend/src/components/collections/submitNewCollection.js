import { toTurkishUpperCase } from "@/utils/collectionUtils";
import { buildCollectionSubmitPayload } from "./newCollectionForm";
import { confirmMailOrderCompany } from "./confirmMailOrderCompany";

export async function submitNewCollection({
  event,
  submitting,
  submitLockRef,
  requiresMaturityDate,
  form,
  mailOrderCompanies,
  setValidated,
  onSubmit,
}) {
  event.preventDefault();

  if (submitting || submitLockRef.current) {
    return;
  }

  const formElement = event.currentTarget;

  if (!formElement.checkValidity()) {
    event.stopPropagation();
    setValidated(true);
    return;
  }

  if (requiresMaturityDate && !form.maturityDate) {
    setValidated(true);
    return;
  }

  const mailOrderCompany = toTurkishUpperCase(form.mailOrderCompany).trim();

  if (form.paymentType === "MAIL_ORDER" && mailOrderCompany) {
    const confirmed = await confirmMailOrderCompany(
      mailOrderCompany,
      mailOrderCompanies
    );

    if (!confirmed) {
      return;
    }
  }

  submitLockRef.current = true;

  await onSubmit(
    buildCollectionSubmitPayload(form, requiresMaturityDate, mailOrderCompany)
  );
}
