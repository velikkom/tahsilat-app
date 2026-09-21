"use client";

import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";
import { FaChevronDown, FaSignOutAlt, FaUser } from "react-icons/fa";
import { logout } from "@/services/authService";
import { roleLabel, userDisplayName, userInitials } from "@/utils/userDisplay";

const ProfileTrigger = forwardRef(function ProfileTrigger(
  { children, onClick, className = "", variant: _variant, ...props },
  ref
) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={`app-profile-trigger touch-target ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

export default function NavbarProfileMenu({ user, loading = false }) {
  const router = useRouter();
  const name = userDisplayName(user);
  const initials = loading ? "" : userInitials(user);
  const email = user?.email || "";
  const role = roleLabel(user?.role);

  function handleProfile() {
    router.push("/profile");
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as={ProfileTrigger}
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

      <Dropdown.Menu className="app-profile-menu">
        <div className="app-profile-menu__header">
          <span className="app-profile-avatar app-profile-avatar--lg" aria-hidden>
            {initials}
          </span>
          <div className="min-width-0">
            <div className="app-profile-menu__name text-truncate">{name}</div>
            {email ? (
              <div className="app-profile-menu__email text-truncate">{email}</div>
            ) : null}
            <div className="app-profile-menu__badge">{role}</div>
          </div>
        </div>

        <Dropdown.Divider />

        <Dropdown.Item
          as="button"
          onClick={handleProfile}
          className="app-profile-menu__item"
        >
          <FaUser aria-hidden />
          Profil
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item
          as="button"
          onClick={handleLogout}
          className="app-profile-menu__item app-profile-menu__item--danger"
        >
          <FaSignOutAlt aria-hidden />
          Çıkış
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
