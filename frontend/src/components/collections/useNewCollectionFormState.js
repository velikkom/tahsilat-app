import { useEffect, useMemo, useRef, useState } from "react";
import useCustomers from "@/hooks/useCustomers";
import { getMailOrderCompanies } from "@/services/collectionService";
import { createInitialForm, mapCollectionToForm } from "./newCollectionForm";

export default function useNewCollectionFormState({
  show,
  submitting,
  mode,
  initialCollection,
  defaultCustomerId,
}) {
  const { refreshCustomers } = useCustomers();
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState(createInitialForm());
  const [mailOrderCompanies, setMailOrderCompanies] = useState([]);
  const submitLockRef = useRef(false);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!show) {
      return;
    }

    refreshCustomers({ silent: true });

    let cancelled = false;

    getMailOrderCompanies()
      .then((names) => {
        if (!cancelled && Array.isArray(names)) {
          setMailOrderCompanies(names);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [show, refreshCustomers]);

  useEffect(() => {
    if (show) {
      setValidated(false);
      submitLockRef.current = false;
      setForm(
        isEditMode && initialCollection
          ? mapCollectionToForm(initialCollection)
          : createInitialForm(defaultCustomerId)
      );
    }
  }, [show, isEditMode, initialCollection?.id, defaultCustomerId]);

  useEffect(() => {
    if (!submitting) {
      submitLockRef.current = false;
    }
  }, [submitting]);

  const requiresMaturityDate = useMemo(() => {
    return (
      form.paymentType === "CHECK" || form.paymentType === "PROMISSORY_NOTE"
    );
  }, [form.paymentType]);

  return {
    validated,
    setValidated,
    form,
    setForm,
    mailOrderCompanies,
    submitLockRef,
    isEditMode,
    requiresMaturityDate,
  };
}
