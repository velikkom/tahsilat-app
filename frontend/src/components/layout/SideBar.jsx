"use client";

import SidebarNav from "./SidebarNav";

export default function Sidebar() {
  return (
    <aside className="app-sidebar bg-dark text-white d-flex flex-column p-3">
      <SidebarNav />
    </aside>
  );
}
