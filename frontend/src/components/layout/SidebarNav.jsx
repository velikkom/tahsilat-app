"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartLine,
  FaUserCog,
  FaUsers,
  FaMoneyCheckAlt,
  FaRoute,
} from "react-icons/fa";
import useCurrentUser from "@/hooks/useCurrentUser";

const BASE_MENUS = [
  { label: "Ana sayfa", href: "/dashboard", icon: <FaChartLine /> },
  { label: "Müşteriler", href: "/customers", icon: <FaUsers /> },
  { label: "Tahsilatlar", href: "/collections", icon: <FaMoneyCheckAlt /> },
  { label: "Turlar", href: "/trips", icon: <FaRoute /> },
];

const ADMIN_MENU = {
  label: "Kullanıcılar",
  href: "/admin/users",
  icon: <FaUserCog />,
};

export default function SidebarNav({ onNavigate }) {
  const pathname = usePathname();
  const { isAdmin } = useCurrentUser();

  const menus = isAdmin ? [...BASE_MENUS, ADMIN_MENU] : BASE_MENUS;

  function handleLinkClick() {
    onNavigate?.();
  }

  return (
    <div className="d-flex flex-column h-100 flex-grow-1">
      <div className="sidebar-brand mb-4 mb-lg-5">
        <h3 className="fw-bold mb-0 sidebar-brand__title">Tahsilat</h3>
      </div>

      <nav className="d-flex flex-column gap-2 flex-grow-1">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            onClick={handleLinkClick}
            className={`sidebar-nav-link d-flex align-items-center gap-3 px-3 py-3 rounded text-decoration-none ${
              pathname === menu.href || pathname.startsWith(`${menu.href}/`)
                ? "sidebar-nav-link--active"
                : ""
            }`}
          >
            {menu.icon}
            <span>{menu.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
