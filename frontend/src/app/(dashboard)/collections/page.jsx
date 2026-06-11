"use client";

import { useCallback, useRef, useState } from "react";
import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionsActionsBar from "@/components/sections/CollectionsActionsBar";
import CollectionsTable from "@/components/collections/CollectionsTable";
import NewCollectionModal from "@/components/collections/NewCollectionModal";
import ImportCollectionsModal from "@/components/collections/ImportCollectionsModal";
import Swal from "sweetalert2";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/services/collectionService";
import useCollections from "@/hooks/useCollections";
import useCustomers from "@/hooks/useCustomers";

export default function CollectionsPage() {
  const { collections, loading, refresh } = useCollections();
  const {
    customers,
    loading: loadingCustomers,
    lastCreatedCustomerId,
    clearLastCreatedCustomerId,
  } = useCustomers();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const submittingRef = useRef(false);
  const deletingRef = useRef(false);

  const isBusy = isSubmitting || isDeleting;

  const resetModalState = useCallback(() => {
    setShowModal(false);
    setModalMode("create");
    setEditingCollection(null);
    clearLastCreatedCustomerId();
  }, [clearLastCreatedCustomerId]);

  const executeSubmission = useCallback(
    async (action, successText) => {
      if (submittingRef.current || deletingRef.current) {
        return;
      }

      submittingRef.current = true;
      setIsSubmitting(true);

      try {
        await action();

        resetModalState();

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: successText,
          confirmButtonText: "Tamam",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        await refresh();
      } catch (error) {
        console.error(error);

        await Swal.fire({
          icon: "error",
          title: "Hata",
          text:
            error.message ||
            "Tahsilat kaydedilirken hata oluştu.",
        });
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [refresh, resetModalState]
  );

  const handleModalSubmit = useCallback(
    async (payload) => {
      if (modalMode === "edit" && editingCollection?.id) {
        await executeSubmission(
          () => updateCollection(editingCollection.id, payload),
          "Tahsilat başarıyla güncellendi."
        );
        return;
      }

      await executeSubmission(
        () => createCollection(payload),
        "Tahsilat başarıyla oluşturuldu."
      );
    },
    [modalMode, editingCollection, executeSubmission]
  );

  const handleDeleteCollection = useCallback(
    async (collection) => {
      if (!collection?.id || isBusy || deletingRef.current) {
        return;
      }

      const confirmation = await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu tahsilatı silmek istediğinize emin misiniz?",
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

      if (deletingRef.current) {
        return;
      }

      deletingRef.current = true;
      setIsDeleting(true);
      setDeletingId(collection.id);

      try {
        await deleteCollection(collection.id);

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Tahsilat başarıyla silindi.",
          confirmButtonText: "Tamam",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        await refresh();
      } catch (error) {
        console.error(error);

        await Swal.fire({
          icon: "error",
          title: "Hata",
          text:
            error.message ||
            "Tahsilat silinirken hata oluştu.",
        });
      } finally {
        deletingRef.current = false;
        setIsDeleting(false);
        setDeletingId(null);
      }
    },
    [isBusy, refresh]
  );

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    resetModalState();
  };

  const handleOpenCreateModal = () => {
    if (isBusy) {
      return;
    }

    setModalMode("create");
    setEditingCollection(null);
    setShowModal(true);
  };

  const handleEditCollection = useCallback(
    (collection) => {
      if (isBusy) {
        return;
      }

      setModalMode("edit");
      setEditingCollection(collection);
      setShowModal(true);
    },
    [isBusy]
  );

  const handleOpenImportModal = () => {
    if (isBusy) {
      return;
    }

    setShowImportModal(true);
  };

  const handleImportCompleted = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <>
      <div className="collections-page-content">
        <CollectionHeader />

        <CollectionsActionsBar
          onImport={handleOpenImportModal}
          onCreate={handleOpenCreateModal}
          disabled={isBusy}
        />

      <CollectionsTable
        collections={collections}
        loading={loading}
        onEdit={handleEditCollection}
        onDelete={handleDeleteCollection}
        actionsDisabled={isBusy}
        deletingId={deletingId}
      />

      <NewCollectionModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        customers={customers}
        submitting={isSubmitting}
        loadingCustomers={loadingCustomers}
        mode={modalMode}
        initialCollection={editingCollection}
        defaultCustomerId={
          modalMode === "create" ? lastCreatedCustomerId : ""
        }
        lockCustomerSelection={Boolean(
          modalMode === "create" && lastCreatedCustomerId
        )}
      />

      <ImportCollectionsModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={handleImportCompleted}
      />
      </div>
    </>
  );
}
