"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import CustomerDetailHeader from "@/components/customers/detail/CustomerDetailHeader";
import CustomerTabs from "@/components/customers/detail/CustomerTabs";
import CustomerCreateModal from "@/components/customers/CustomerCreateModal";
import NewCollectionModal from "@/components/collections/NewCollectionModal";
import useCustomerDetail from "@/hooks/useCustomerDetail";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useBreadcrumbLabel } from "@/context/BreadcrumbLabelsContext";
import { createCollection } from "@/services/collectionService";
import { deleteCustomer, updateCustomer } from "@/services/customerService";

export default function CustomerDetailPage() {
  const router = useRouter();
  const { customer, loading, refresh } = useCustomerDetail();
  const { isAdmin } = useCurrentUser();

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataKey, setDataKey] = useState(0);

  useBreadcrumbLabel(customer?.id ? `/customers/${customer.id}` : "", customer?.companyName);

  const busy = isSubmitting || isSubmittingCollection || isDeleting;

  const handleEdit = useCallback(() => {
    if (busy) {
      return;
    }

    setShowCustomerModal(true);
  }, [busy]);

  const handleDelete = useCallback(async () => {
    if (!customer?.id || busy) {
      return;
    }

    const confirmation = await Swal.fire({
      title: "Emin misiniz?",
      text: `${customer.companyName} müşterisini silmek istediğinize emin misiniz?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCustomer(customer.id);
      await Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Müşteri başarıyla silindi.",
        confirmButtonText: "Tamam",
      });
      router.push("/customers");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Müşteri silinemedi.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [busy, customer, router]);

  const handleModalSubmit = useCallback(
    async (payload) => {
      if (!customer?.id) {
        return;
      }

      setIsSubmitting(true);

      try {
        await updateCustomer(customer.id, payload);
        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Müşteri başarıyla güncellendi.",
          confirmButtonText: "Tamam",
        });
        setShowCustomerModal(false);
        await refresh();
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Hata",
          text: error.message || "Müşteri kaydedilemedi.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [customer, refresh]
  );

  const handleCollectionSubmit = useCallback(async (payload) => {
    setIsSubmittingCollection(true);

    try {
      await createCollection(payload);
      await Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Tahsilat başarıyla oluşturuldu.",
        confirmButtonText: "Tamam",
      });
      setShowCollectionModal(false);
      setDataKey((current) => current + 1);
      await refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Tahsilat kaydedilemedi.",
      });
    } finally {
      setIsSubmittingCollection(false);
    }
  }, [refresh]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-detail-page d-flex flex-column gap-3">
        <Link
          href="/customers"
          className="btn btn-outline-secondary touch-target align-self-start"
        >
          Geri
        </Link>
        <div className="alert alert-danger mb-0">Müşteri bulunamadı.</div>
      </div>
    );
  }

  return (
    <>
      <div className="customer-detail-page d-flex flex-column gap-3 gap-md-4">
        <CustomerDetailHeader
          customer={customer}
          isAdmin={isAdmin}
          busy={busy}
          onNewCollection={() => setShowCollectionModal(true)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <CustomerTabs key={`${customer.id}-${dataKey}`} customer={customer} />
      </div>

      <CustomerCreateModal
        show={showCustomerModal}
        mode="edit"
        customer={customer}
        submitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setShowCustomerModal(false);
          }
        }}
        onSubmit={handleModalSubmit}
      />

      <NewCollectionModal
        show={showCollectionModal}
        onClose={() => {
          if (!isSubmittingCollection) {
            setShowCollectionModal(false);
          }
        }}
        onSubmit={handleCollectionSubmit}
        customers={[customer]}
        submitting={isSubmittingCollection}
        defaultCustomerId={customer.id}
        lockCustomerSelection
      />
    </>
  );
}
