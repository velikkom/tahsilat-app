"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UsersManagementTable from "@/components/admin/UsersManagementTable";
import useCurrentUser from "@/hooks/useCurrentUser";
import usePendingUserCount from "@/context/PendingUsersCountContext";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useCurrentUser();
  const { refresh: refreshCount } = usePendingUserCount();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-users-page d-flex flex-column gap-3 gap-md-4">
      <div>
        <h1 className="fw-bold page-header__title mb-1">Kullanıcı Yönetimi</h1>
        <p className="text-muted mb-0">
          Yeni kayıt taleplerini inceleyin ve kullanıcıları aktifleştirin.
        </p>
      </div>

      <UsersManagementTable onUpdated={() => refreshCount({ silent: true })} />
    </div>
  );
}
