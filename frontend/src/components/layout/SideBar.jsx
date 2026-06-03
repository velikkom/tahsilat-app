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

export default function Sidebar() {
  const pathname = usePathname();

  function handleLogout() {
    logout();

    window.location.href = "/login";
  }

  const menus = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <FaChartLine />,
    },

    {
      label: "Customers",
      href: "/customers",
      icon: <FaUsers />,
    },

    {
      label: "Collections",
      href: "/collections",
      icon: <FaMoneyCheckAlt />,
    },
  ];

  return (
    <aside
      className="
                bg-dark
                text-white
                d-flex
                flex-column
                p-3
            "
      style={{
        width: "260px",
        minHeight: "100vh",
      }}
    >
      <div className="mb-5">
        <h3
          className="
                        fw-bold
                    "
        >
          Tahsilat ERP
        </h3>
      </div>

      <nav
        className="
                    d-flex
                    flex-column
                    gap-2
                "
      >
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`
                                d-flex
                                align-items-center
                                gap-3
                                px-3
                                py-3
                                rounded
                                text-decoration-none
                                text-white

                                ${pathname === menu.href ? "bg-secondary" : ""}
                                `}
          >
            {menu.icon}

            <span>{menu.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="
                        btn
                        btn-outline-light
                        w-100
                        d-flex
                        align-items-center
                        justify-content-center
                        gap-2
                    "
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}
