"use client";

import Link from "next/link";
import { FaBell } from "react-icons/fa";
import usePendingUserCount from "@/context/PendingUsersCountContext";

export default function NewUserNotification() {
  const { count, loading, enabled } = usePendingUserCount();

  if (!enabled || loading || count === 0) {
    return null;
  }

  return (
    <Link
      href="/admin/users"
      className="new-user-notification text-decoration-none"
      title="Onay bekleyen kullanıcılar"
    >
      <FaBell className="new-user-notification__icon" aria-hidden />
      <span className="new-user-notification__text">
        {count} Yeni Kullanıcı
      </span>
    </Link>
  );
}
