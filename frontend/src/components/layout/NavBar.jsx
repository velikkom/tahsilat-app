"use client";

import { FaBars } from "react-icons/fa";

export default function Navbar({ onMenuToggle }) {
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
          Financial Management System
        </h5>
      </div>

      <div className="d-flex align-items-center gap-3 flex-shrink-0">
        <span className="app-navbar__welcome text-muted small">
          Welcome Admin
        </span>
      </div>
    </header>
  );
}
