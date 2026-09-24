"use client";

import { useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";
import { FaChevronDown } from "react-icons/fa";
import { logout } from "@/services/authService";
import useTheme from "@/context/ThemeContext";
import { roleLabel, userDisplayName, userInitials } from "@/utils/userDisplay";
import NavbarProfileTrigger from "./NavbarProfileTrigger";
import NavbarProfileMenuPanel from "./NavbarProfileMenuPanel";

export default function NavbarProfileMenu({ user, loading = false }) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const name = userDisplayName(user);
  const initials = loading ? "" : userInitials(user);
  const email = user?.email || "";
  const role = roleLabel(user?.role);

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as={NavbarProfileTrigger}
        id="navbar-profile"
        aria-label="Hesap menüsü"
      >
        <span
          className={`app-profile-avatar${loading ? " app-profile-avatar--loading" : ""}`}
          aria-hidden
        >
          {initials}
        </span>
        <span className="app-profile-trigger__meta">
          <span className="app-profile-trigger__name text-truncate">
            {loading ? "Yükleniyor" : name}
          </span>
          <span className="app-profile-trigger__role text-truncate">
            {loading ? " " : role}
          </span>
        </span>
        <FaChevronDown className="app-profile-trigger__caret" aria-hidden />
      </Dropdown.Toggle>

      <NavbarProfileMenuPanel
        name={name}
        email={email}
        role={role}
        initials={initials}
        isDark={isDark}
        onProfile={() => router.push("/profile")}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
    </Dropdown>
  );
}
