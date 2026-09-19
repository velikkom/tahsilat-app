"use client";

import Link from "next/link";
import { FaBell } from "react-icons/fa";
import useDueMaturitySummary from "@/context/DueMaturityContext";

export default function DueMaturityNotification() {
  const { count, loading, enabled } = useDueMaturitySummary();

  if (!enabled || loading || count === 0) {
    return null;
  }

  return (
    <Link
      href="/collections?due=1"
      className="new-user-notification new-user-notification--due text-decoration-none"
      title="Vadesi gelen çek/senet"
    >
      <FaBell className="new-user-notification__icon" aria-hidden />
      <span className="new-user-notification__text">
        {count} vadesi gelen çek/senet
      </span>
    </Link>
  );
}
