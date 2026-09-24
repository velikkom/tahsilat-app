import { useState } from "react";
import { useRouter } from "next/navigation";
import useCustomerDetail from "@/hooks/useCustomerDetail";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useBreadcrumbLabel } from "@/context/BreadcrumbLabelsContext";
import useCustomerDetailActions from "./useCustomerDetailActions";

export default function useCustomerDetailPage() {
  const router = useRouter();
  const { customer, loading, refresh } = useCustomerDetail();
  const { isAdmin } = useCurrentUser();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataKey, setDataKey] = useState(0);

  useBreadcrumbLabel(
    customer?.id ? `/customers/${customer.id}` : "",
    customer?.companyName
  );

  const busy = isSubmitting || isSubmittingCollection || isDeleting;
  const actions = useCustomerDetailActions({
    customer,
    router,
    refresh,
    busy,
    setShowCustomerModal,
    setShowCollectionModal,
    setIsSubmitting,
    setIsSubmittingCollection,
    setIsDeleting,
    setDataKey,
  });

  return {
    customer,
    loading,
    isAdmin,
    busy,
    showCustomerModal,
    showCollectionModal,
    isSubmitting,
    isSubmittingCollection,
    dataKey,
    setShowCustomerModal,
    setShowCollectionModal,
    ...actions,
  };
}
