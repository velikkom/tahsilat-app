"use client";

import { Dropdown } from "react-bootstrap";
import { FaMoon, FaSignOutAlt, FaSun, FaUser } from "react-icons/fa";

export default function NavbarProfileMenuPanel({
  name,
  email,
  role,
  initials,
  isDark,
  onProfile,
  onToggleTheme,
  onLogout,
}) {
  return (
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

      <Dropdown.Item as="button" onClick={onProfile} className="app-profile-menu__item">
        <FaUser aria-hidden />
        Profil
      </Dropdown.Item>

      <Dropdown.Item as="button" onClick={onToggleTheme} className="app-profile-menu__item">
        {isDark ? <FaSun aria-hidden /> : <FaMoon aria-hidden />}
        {isDark ? "Açık tema" : "Koyu tema"}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item
        as="button"
        onClick={onLogout}
        className="app-profile-menu__item app-profile-menu__item--danger"
      >
        <FaSignOutAlt aria-hidden />
        Çıkış
      </Dropdown.Item>
    </Dropdown.Menu>
  );
}
