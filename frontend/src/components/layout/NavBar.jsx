"use client";

import { FaBars } from "react-icons/fa";
import { usePathname } from "next/navigation";
import NewUserNotification from "./NewUserNotification";
import useCurrentUser from "@/hooks/useCurrentUser";

const PAGE_TITLES = [
  { prefix: "/dashboard", title: "Ana Sayfa" },
  { prefix: "/customers", title: "Müşteriler" },
  { prefix: "/collections", title: "Tahsilatlar" },
  { prefix: "/trips", title: "Turlar" },
  { prefix: "/admin/users", title: "Kullanıcılar" },
];

function pageTitleFor(pathname) {
  const match = PAGE_TITLES.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)
  );

  return match?.title || "Tahsilat";
}

export default function Navbar({ onMenuToggle }) {
  const { user } = useCurrentUser();
  const pathname = usePathname();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Admin";

  return (
    <header className="app-navbar bg-white border-bottom px-3 px-md-4 py-3 d-flex justify-content-between align-items-center gap-2">
      <div className="d-flex align-items-center gap-2 gap-md-3 min-v-0">
        <button
          type="button"
          className="btn btn-outline-secondary sidebar-menu-toggle touch-target flex-shrink-0"
          onClick={onMenuToggle}
          aria-label="Menüyü aç"
        >
          <FaBars />
        </button>

        <h5 className="app-navbar__title mb-0 text-truncate">
          {pageTitleFor(pathname)}
        </h5>
      </div>

      <div className="d-flex align-items-center gap-3 flex-shrink-0">
        <NewUserNotification />
        <span className="app-navbar__welcome text-muted small">
          Hoş geldiniz, {displayName}
        </span>
      </div>
    </header>
  );
}
