"use client";

import SidebarNav from "./SidebarNav";

/**
 * Desktop sidebar only (>= 1024px).
 * Visibility is controlled by .app-sidebar in responsive.css — do NOT add d-flex here
 * (Bootstrap d-flex uses !important and breaks mobile hide).
 */
export default function Sidebar() {
  return (
    <aside className="app-sidebar bg-dark text-white p-3 min-vh-100">
      <SidebarNav />
    </aside>
  );
}
