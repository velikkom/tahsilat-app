"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";

import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionsTable from "@/components/collections/CollectionsTable";
import NewCollectionModal from "@/components/collections/NewCollectionModal";
import Swal from "sweetalert2";
import { createCollection } from "@/services/collectionService";
import { getCustomers } from "@/services/customerService";

export default function CollectionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const handleCreateCollection = async (payload) => {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await createCollection(payload);

      setShowCreateModal(false);

      await Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Tahsilat başarıyla oluşturuldu.",
        confirmButtonText: "Tamam",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      window.location.reload();
    } catch (error) {
      console.error(error);

      submittingRef.current = false;
      setIsSubmitting(false);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Tahsilat oluşturulurken hata oluştu.",
      });
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setShowCreateModal(false);
  };

  const handleOpenModal = () => {
    if (isSubmitting) {
      return;
    }

    setShowCreateModal(true);
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <Button onClick={handleOpenModal} disabled={isSubmitting}>
          Yeni Tahsilat
        </Button>
      </div>

      <CollectionHeader />

      <CollectionsTable />

      <NewCollectionModal
        show={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateCollection}
        customers={customers}
        submitting={isSubmitting}
        loadingCustomers={loadingCustomers}
      />
    </>
  );
}
