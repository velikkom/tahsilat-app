"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";

import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionsTable from "@/components/collections/CollectionsTable";
import NewCollectionModal from "@/components/collections/NewCollectionModal";
import ImportCollectionsModal from "@/components/collections/ImportCollectionsModal";
import Swal from "sweetalert2";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/services/collectionService";
import { getCustomers } from "@/services/customerService";
import useCollections from "@/hooks/useCollections";

export default function CollectionsPage() {
  const { collections, loading, refresh } = useCollections();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const submittingRef = useRef(false);
  const deletingRef = useRef(false);

  const isBusy = isSubmitting || isDeleting;

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);

      const response = await getCustomers();

      setCustomers(response.content || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const resetModalState = useCallback(() => {
    setShowModal(false);
    setModalMode("create");
    setEditingCollection(null);
  }, []);

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
      <div className="d-flex justify-content-end gap-2 mb-3">
        <Button
          variant="outline-secondary"
          onClick={handleOpenImportModal}
          disabled={isBusy}
        >
          Excel Import
        </Button>
        <Button onClick={handleOpenCreateModal} disabled={isBusy}>
          Yeni Tahsilat
        </Button>
      </div>

      <CollectionHeader />

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
      />

      <ImportCollectionsModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={handleImportCompleted}
      />
    </>
  );
}
