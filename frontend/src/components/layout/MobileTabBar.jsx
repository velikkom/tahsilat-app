"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartLine, FaMoneyCheckAlt, FaRoute, FaUsers } from "react-icons/fa";

const TAB_ITEMS = [
  { label: "Ana sayfa", href: "/dashboard", icon: <FaChartLine /> },
  { label: "Tahsilatlar", href: "/collections", icon: <FaMoneyCheckAlt /> },
  { label: "Turlar", href: "/trips", icon: <FaRoute /> },
  { label: "Müşteriler", href: "/customers", icon: <FaUsers /> },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="mobile-tab-bar" aria-label="Ana gezinme">
      {TAB_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-tab-bar__link touch-target ${
              isActive ? "mobile-tab-bar__link--active" : ""
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="mobile-tab-bar__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="mobile-tab-bar__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
