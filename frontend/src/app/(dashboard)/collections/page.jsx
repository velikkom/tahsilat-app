"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";

import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionsTable from "@/components/collections/CollectionsTable";
import NewCollectionModal from "@/components/collections/NewCollectionModal";
import Swal from "sweetalert2";
import {
  createCollection,
  updateCollection,
} from "@/services/collectionService";
import { getCustomers } from "@/services/customerService";
import useCollections from "@/hooks/useCollections";

export default function CollectionsPage() {
  const { collections, loading, refresh } = useCollections();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

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
      if (submittingRef.current) {
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

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    resetModalState();
  };

  const handleOpenCreateModal = () => {
    if (isSubmitting) {
      return;
    }

    setModalMode("create");
    setEditingCollection(null);
    setShowModal(true);
  };

  const handleEditCollection = useCallback(
    (collection) => {
      if (isSubmitting) {
        return;
      }

      setModalMode("edit");
      setEditingCollection(collection);
      setShowModal(true);
    },
    [isSubmitting]
  );

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <Button onClick={handleOpenCreateModal} disabled={isSubmitting}>
          Yeni Tahsilat
        </Button>
      </div>

      <CollectionHeader />

      <CollectionsTable
        collections={collections}
        loading={loading}
        onEdit={handleEditCollection}
        actionsDisabled={isSubmitting}
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
    </>
  );
}
