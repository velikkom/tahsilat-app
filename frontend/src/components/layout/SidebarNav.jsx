"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartLine,
  FaUsers,
  FaMoneyCheckAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { logout } from "@/services/authService";

const MENUS = [
  { label: "Dashboard", href: "/dashboard", icon: <FaChartLine /> },
  { label: "Customers", href: "/customers", icon: <FaUsers /> },
  { label: "Collections", href: "/collections", icon: <FaMoneyCheckAlt /> },
];

export default function SidebarNav({ onNavigate }) {
  const pathname = usePathname();

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  function handleLinkClick() {
    onNavigate?.();
  }

  return (
    <div className="d-flex flex-column h-100 flex-grow-1">
      <div className="sidebar-brand mb-4 mb-lg-5">
        <h3 className="fw-bold mb-0 sidebar-brand__title">Tahsilat ERP</h3>
      </div>

      <nav className="d-flex flex-column gap-2 flex-grow-1">
        {MENUS.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            onClick={handleLinkClick}
            className={`sidebar-nav-link d-flex align-items-center gap-3 px-3 py-3 rounded text-decoration-none text-white ${
              pathname === menu.href ? "sidebar-nav-link--active" : ""
            }`}
          >
            {menu.icon}
            <span>{menu.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 touch-target"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}
