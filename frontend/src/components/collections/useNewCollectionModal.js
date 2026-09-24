import { applyPaymentTypeChange } from "./newCollectionForm";
import { submitNewCollection } from "./submitNewCollection";
import useNewCollectionFormState from "./useNewCollectionFormState";

export default function useNewCollectionModal({
  show,
  onClose,
  onSubmit,
  submitting,
  loadingCustomers,
  mode,
  initialCollection,
  defaultCustomerId,
}) {
  const state = useNewCollectionFormState({
    show,
    submitting,
    mode,
    initialCollection,
    defaultCustomerId,
  });

  return {
    validated: state.validated,
    form: state.form,
    mailOrderCompanies: state.mailOrderCompanies,
    isEditMode: state.isEditMode,
    requiresMaturityDate: state.requiresMaturityDate,
    isFormDisabled: submitting || loadingCustomers,
    handleChange: (e) => {
      const { name, value } = e.target;
      state.setForm((prev) => ({ ...prev, [name]: value }));
    },
    handlePaymentTypeChange: (e) => {
      state.setForm((prev) => applyPaymentTypeChange(prev, e.target.value));
    },
    handleClose: () => {
      if (submitting || state.submitLockRef.current) {
        return;
      }
      onClose();
    },
    handleSubmit: (e) =>
      submitNewCollection({
        event: e,
        submitting,
        submitLockRef: state.submitLockRef,
        requiresMaturityDate: state.requiresMaturityDate,
        form: state.form,
        mailOrderCompanies: state.mailOrderCompanies,
        setValidated: state.setValidated,
        onSubmit,
      }),
  };
}
